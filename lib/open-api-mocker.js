'use strict';

const jsonRefs = require('json-refs');

const { Parser: OpenApiParser } = require('./openapi');
const { Parser: ServersParser } = require('./servers');
const { Parser: PathsParser } = require('./paths');

class OpenApiMocker {

	static get defaultPort() {
		return 5000;
	}

	constructor({ schema, port, server = 'express' }) {
		this.schema = schema;
		// eslint-disable-next-line global-require, import/no-dynamic-require
		const Server = require(`./mocker/${server}/server`);

		this.server = new Server();
		this.port = port || this.constructor.defaultPort;
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

		this.server
			.setServers(this.api.servers)
			.setPort(this.port)
			.setPaths(this.api.paths)
			.init();

	}

}

module.exports = OpenApiMocker;
