'use strict';

/* istanbul ignore file */

const parsePreferHeader = require('parse-prefer-header');
const memoize = require('micro-memoize');
const logger = require('lllog')();
const colors = require('colors');

// Create a function that is memoized using the URL, query, the Prefer header and the body.
// eslint-disable-next-line no-unused-vars
const getResponse = async (path, url, query, preferHeader, body) => {
	const {
		example: preferredExampleName, statuscode: preferredStatusCode,
		statuscoderate: preferredStatusCodeRate, latency: preferredLatency,
		latencyrate: preferredLatencyRate
	} = parsePreferHeader(preferHeader) || {};

	if(preferredStatusCode)
		logger.debug(`Searching requested response with status code ${preferredStatusCode}`);
	else
		logger.debug('Searching first response');

	const response = await path.getResponse(preferredStatusCode, preferredStatusCodeRate, preferredExampleName, preferredLatency, preferredLatencyRate);
	return new Promise(resolve => resolve(response));
};

const getResponseMemo = memoize(getResponse, {
	maxSize: 10
});

const checkContentType = req => {
	const contentType = req.header('content-type');
	if(!contentType)
		logger.warn(`${colors.yellow('*')} Missing content-type header`);
};

const handleRequest = (path, responseHandler) => async (req, res) => {

	checkContentType(req);

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
		return responseHandler(req, res, { errors: failedValidations }, 400);

	const preferHeader = req.header('prefer') || '';

	let response;
	if(preferHeader)
		response = await getResponse(path, req.path, JSON.stringify(req.query), preferHeader, JSON.stringify(requestBody));
	else
		response = await getResponseMemo(path, req.path, JSON.stringify(req.query), preferHeader, JSON.stringify(requestBody));

	const { statusCode, headers: responseHeaders, body, responseMimeType } = response;

	return responseHandler(req, res, body, statusCode, responseHeaders, responseMimeType);
};

module.exports = handleRequest;
