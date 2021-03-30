'use strict';

const jsonRefs = require('json-refs');

const { Parser: OpenApiParser } = require('./openapi');
const { Parser: ServersParser } = require('./servers');
const { Parser: PathsParser } = require('./paths');

class OpenApiMocker {

	static get defaultPort() {
		return 5000;
	}

	constructor({ port, server }) {
		// Legacy handling of string based server that loads a server implementation based on folder name
		if(typeof server === 'string' || server == null) {
			// eslint-disable-next-line global-require, import/no-dynamic-require
			const Server = require(`./mocker/${server || 'express'}/server`);
			server = new Server();
		}

		this.server = server;
		this.port = port || this.constructor.defaultPort;
	}

	setSchema(schema) {
		this.schema = schema;
	}

	async validate() {

		const parsedSchemas = await jsonRefs.resolveRefs(this.schema);

		this.schema = parsedSchemas.resolved;

		const openApiParser = new OpenApiParser();
		const openapi = openApiParser.parse(this.schema);

		const serversParser = new ServersParser();
		const servers = serversParser.parse(this.schema);

		const pathsParser = new PathsParser();
		const paths = pathsParser.parse(this.schema);

		this.api = {
			openapi,
			servers,
			paths
		};
	}

	mock() {
		return this.server
			.setServers(this.api.servers)
			.setPort(this.port)
			.setPaths(this.api.paths)
			.init();
	}

	shutdown() {
		return this.server.shutdown();
	}

}

module.exports = OpenApiMocker;
