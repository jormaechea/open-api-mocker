'use strict';

/* istanbul ignore file */

const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('lllog')();
const colors = require('colors');

const app = express();

const openApiMockSymbol = Symbol('openApiMock');

class Server {

	constructor() {
		this.servers = [];
		this.paths = [];
	}

	setServers(servers) {
		this.servers = servers;
		return this;
	}

	setPort(port) {
		this.port = port;
		return this;
	}

	setPaths(paths) {
		this.paths = paths;
		return this;
	}

	init() {

		app.use('*', (req, res, next) => {

			res[openApiMockSymbol] = {
				initTime: Date.now()
			};

			logger.info(`${colors.yellow('>')} [${req.method}] ${req.originalUrl}`);

			next();
		});

		app.use(
			cookieParser(),
			cors({
				origin: true,
				allowedHeaders: [
					'content-type',
					'janis-client',
					'x-api-key'
				],
				credentials: true
			}),
			bodyParser.json({
				type: '*/*'
			})
		);

		this.paths.map(path => {
			const expressHttpMethod = path.httpMethod.toLowerCase();

			const uris = this._normalizeExpressPath(path.uri);

			app[expressHttpMethod](uris, (req, res) => {

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
					return this.sendResponse(res, { errors: failedValidations }, 400);

				const preferHeader = req.header('prefer') || '';
				const [, preferStatusCode] = preferHeader.match(/statusCode=(\d{3})/) || [];

				const { statusCode, headers: responseHeaders, body } = path.getResponse(preferStatusCode);

				return this.sendResponse(res, body, statusCode, responseHeaders);
			});

			return logger.info(`Handling route ${path.httpMethod.toUpperCase()} ${uris.join(', ')}`);
		});

		app.all('*', this._notFoundHandler.bind(this));

		const server = app.listen(this.port);

		server.on('listening', err => {

			if(err)
				throw err;

			const realPort = server.address().port;

			logger.info(`Mocking API at ${realPort}`);
		});
	}

	_checkContentType(req) {
		const contentType = req.header('content-type');
		if(!contentType)
			logger.warn(`${colors.yellow('*')} Missing content-type header`);
		else if(contentType !== 'application/json')
			logger.warn(`${colors.yellow('*')} Content-type ${contentType} does not match expected 'application/json'`);
	}

	_notFoundHandler(req, res) {
		return this.sendResponse(res, {
			message: `Path not found: ${req.originalUrl}`,
			paths: this.paths.map(({ httpMethod, uri }) => `${httpMethod.toUpperCase()} ${uri}`)
		}, 400);
	}

	_normalizeExpressPath(schemaUri) {
		const normalizedPath = schemaUri.replace(/\{([a-z0-9]+)\}/, ':$1', 'gi').replace(/^\/*/, '/');

		const basePaths = [...new Set(this.servers.map(({ url }) => url.pathname.replace(/\/+$/, '')))];

		return basePaths.length ? basePaths.map(basePath => `${basePath}${normalizedPath}`) : [normalizedPath];
	}

	sendResponse(res, body, statusCode, headers) {

		statusCode = statusCode || 200;
		headers = headers || {};

		const responseTime = Date.now() - res[openApiMockSymbol].initTime;

		const color = statusCode < 400 ? colors.green : colors.red;

		logger.info(`${color('<')} [${statusCode}] ${JSON.stringify(body)} (${responseTime} ms)`);

		res
			.status(statusCode)
			.set(headers)
			.set('x-powered-by', 'jormaechea/open-api-mock')
			.json(body);
	}

}

module.exports = Server;
