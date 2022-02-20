'use strict';

/* istanbul ignore file */

const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('lllog')();
const colors = require('colors');
const handleRequest = require('./request-handler');

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
			bodyParser.json({ limit: '10mb' }),
			bodyParser.urlencoded({ limit: '50mb', extended: false, parameterLimit: 50000 }),
			bodyParser.text(),
			bodyParser.raw()
		);

		this._loadBasePaths();

		this.setRoutes(app);

		app.all('*', this._notFoundHandler.bind(this));

		return this.startServer(app);
	}

	setRoutes(app) {
		this.paths.map(path => this.setRoute(app, path));
	}

	setRoute(app, path) {

		logger.debug(`Processing schema path ${path.httpMethod.toUpperCase()} ${path.uri}`);

		const expressHttpMethod = path.httpMethod.toLowerCase();

		const uris = this._normalizeExpressPath(path.uri);

		app[expressHttpMethod](uris, handleRequest(path, this.sendResponse));

		return uris.map(uri => {
			return logger.info(`Handling route ${path.httpMethod.toUpperCase()} ${uri}`);
		});
	}

	startServer(app) {
		return new Promise((resolve, reject) => {
			this.server = app.listen(this.port);

			this.server.on('listening', err => {

				if(err)
					reject(err);

				const realPort = this.server.address().port;

				logger.info(`Mocking API at http://localhost:${realPort}/`);

				resolve();
			});
		});
	}

	shutdown() {
		return new Promise((resolve, reject) => {
			logger.debug('Closing express server...');
			this.server.close(err => {
				if(err)
					return reject(err);

				resolve();
			});
		});
	}

	_loadBasePaths() {
		const basePaths = [...new Set(this.servers.map(({ url }) => url.pathname.replace(/\/+$/, '')))];

		if(basePaths.length)
			logger.debug(`Found the following base paths: ${basePaths.join(', ')}`);

		this.basePaths = basePaths.length ? basePaths : [''];
	}

	_notFoundHandler(req, res) {

		const validPaths = [];
		for(const { httpMethod, uri: schemaUri } of this.paths) {

			const uris = this._normalizeExpressPath(schemaUri);

			for(const uri of uris)
				validPaths.push(`${httpMethod.toUpperCase()} ${uri}`);
		}

		return this.sendResponse(req, res, {
			message: `Path not found: ${req.originalUrl}`,
			paths: validPaths
		}, 400);
	}

	_normalizeExpressPath(schemaUri) {
		const normalizedPath = schemaUri.replace(/\{([a-z0-9_]+)\}/gi, ':$1').replace(/^\/*/, '/');

		return this.basePaths.map(basePath => `${basePath}${normalizedPath}`);
	}

	sendResponse(req, res, body, statusCode, headers, responseMimeType = '') {

		statusCode = statusCode || 200;
		headers = headers || {};

		// HTTP/2 prohibits Connection header
		// If this is not set, Chrome keeps the connection open and this prevents watch feature to work properly
		// We'll see what we can do when Chrome starts using HTTP/2
		// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Connection
		if(req.httpVersion.startsWith('0') || req.httpVersion.startsWith('1'))
			res.set('Connection', 'close');

		const responseTime = Date.now() - res[openApiMockSymbol].initTime;

		const color = statusCode < 400 ? colors.green : colors.red;

		logger.info(`${color('<')} [${statusCode}] ${JSON.stringify(body)} (${responseTime} ms)`);

		res
			.status(statusCode)
			.set(headers)
			.set('x-powered-by', 'jormaechea/open-api-mocker');

		const mimeType = responseMimeType ? responseMimeType.toLowerCase() : '';

		if(mimeType)
			res.type(mimeType);

		return res.send(typeof body === 'number' ? body.toString() : body);
	}

}

module.exports = Server;
