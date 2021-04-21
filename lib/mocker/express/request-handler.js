'use strict';

/* istanbul ignore file */

const parsePreferHeader = require('parse-prefer-header');
const memoize = require('micro-memoize');
const logger = require('lllog')();

// Create a function that is memoized using the URL, query, the Prefer header and the body.
// eslint-disable-next-line no-unused-vars
const getResponse = (path, url, query, preferHeader, body) => {
	const { example: preferredExampleName, statuscode: preferredStatusCode } = parsePreferHeader(preferHeader) || {};

	if(preferredStatusCode)
		logger.debug(`Searching requested response with status code ${preferredStatusCode}`);
	else
		logger.debug('Searching first response');
	return path.getResponse(preferredStatusCode, preferredExampleName);
};

const getResponseMemo = memoize(getResponse, {
	maxSize: 10
});

const handleRequest = path => (req, res) => {

	this._checkContentType(req);

	const {
		query,
		params,
		headers,
		cookies,
		body: requestBody
	} = req;

	const failedValidations = path.validateRequestParameters({
		query,
		path: params,
		headers,
		cookies,
		requestBody
	});

	if(failedValidations.length)
		return this.sendResponse(req, res, { errors: failedValidations }, 400);

	const preferHeader = req.header('prefer') || '';

	const { statusCode, headers: responseHeaders, body } =
			getResponseMemo(path, req.path, JSON.stringify(req.query), preferHeader, JSON.stringify(requestBody));

	return this.sendResponse(req, res, body, statusCode, responseHeaders);
};

module.exports = handleRequest;
