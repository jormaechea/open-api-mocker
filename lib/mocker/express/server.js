'use strict';

const app = require('express')();
const logger = require('lllog')();

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

			logger.info(`> [${req.method}] ${req.originalUrl}`);

			next();
		});

		this.paths.map(path => {
			const expressHttpMethod = path.httpMethod.toLowerCase();

			const uri = this._normalizeExpressPath(path.uri);

			app[expressHttpMethod](uri, (req, res) => {

				const {
					query,
					params,
					headers,
					cookies
				} = req;

				const failedValidations = path.validateRequestParameters({ query, path: params, headers, cookies });

				if(failedValidations.length)
					return this.sendResponse(res, { errors: failedValidations }, 400);

				return this.sendResponse(res, path.getResponse());
			});

			return logger.info(`Handling route ${path.httpMethod.toUpperCase()} ${uri}`);
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

	_notFoundHandler(req, res) {
		return this.sendResponse(res, {
			message: 'Path not found',
			paths: this.paths.map(({ httpMethod, uri }) => `${httpMethod.toUpperCase()} ${uri}`)
		}, 400);
	}

	_normalizeExpressPath(schemaUri) {
		return schemaUri.replace(/\{([a-z0-9]+)\}/, ':$1', 'gi');
	}

	sendResponse(res, body, statusCode, headers) {

		statusCode = statusCode || 200;
		headers = headers || {};

		const responseTime = (Date.now() - res[openApiMockSymbol].initTime) / 1000;

		logger.info(`< [${statusCode}] ${JSON.stringify(body)} (${responseTime} ms)`);

		res
			.status(statusCode)
			.set(headers)
			.json(body);
	}

}

module.exports = Server;
