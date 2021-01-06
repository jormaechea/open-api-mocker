'use strict';

/* istanbul ignore file */

const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('lllog')();
const colors = require('colors');

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

	async init() {

		if(this.server)
			await this.shutdown();

		const app = express();
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
				credentials: true
			}),
			bodyParser.json(),
			express.urlencoded({ limit: '50mb', extended: false, parameterLimit: 50000 }),
			express.text(),
			express.raw()
		);

		this._loadBasePaths();

		this.paths.map(path => {

			logger.debug(`Processing schema path ${path.httpMethod.toUpperCase()} ${path.uri}`);

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

				if(preferStatusCode)
					logger.debug(`Searching requested response with status code ${preferStatusCode}`);
				else
					logger.debug('Searching first response');

				const { statusCode, headers: responseHeaders, body } = path.getResponse(preferStatusCode);

				return this.sendResponse(res, body, statusCode, responseHeaders);
			});

			return uris.map(uri => {
				return logger.info(`Handling route ${path.httpMethod.toUpperCase()} ${uri}`);
			});
		});

		app.all('*', this._notFoundHandler.bind(this));

		this.server = app.listen(this.port);

		this.server.on('listening', err => {

			if(err)
				throw err;

			const realPort = this.server.address().port;

			logger.info(`Mocking API at ${realPort}`);
		});
	}

	shutdown() {
		logger.debug('Closing express server...');
		this.server.close();
	}

	_loadBasePaths() {
		const basePaths = [...new Set(this.servers.map(({ url }) => url.pathname.replace(/\/+$/, '')))];

		if(basePaths.length)
			logger.debug(`Found the following base paths: ${basePaths.join(', ')}`);

		this.basePaths = basePaths.length ? basePaths : [''];
	}

	_checkContentType(req) {
		const contentType = req.header('content-type');
		if(!contentType)
			logger.warn(`${colors.yellow('*')} Missing content-type header`);
		else if(contentType !== 'application/json')
			logger.warn(`${colors.yellow('*')} Content-type ${contentType} does not match expected 'application/json'`);
	}

	_notFoundHandler(req, res) {

		const validPaths = [];
		for(const { httpMethod, uri: schemaUri } of this.paths) {

			const uris = this._normalizeExpressPath(schemaUri);

			for(const uri of uris)
				validPaths.push(`${httpMethod.toUpperCase()} ${uri}`);
		}

		return this.sendResponse(res, {
			message: `Path not found: ${req.originalUrl}`,
			paths: validPaths
		}, 400);
	}

	_normalizeExpressPath(schemaUri) {
		const normalizedPath = schemaUri.replace(/\{([a-z0-9_]+)\}/gi, ':$1').replace(/^\/*/, '/');

		return this.basePaths.map(basePath => `${basePath}${normalizedPath}`);
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
