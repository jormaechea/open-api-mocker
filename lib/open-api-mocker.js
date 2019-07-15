'use strict';

const { Parser: OpenApiParser } = require('./openapi');
const { Parser: ServersParser } = require('./servers');

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

	validate() {

		const openApiParser = new OpenApiParser();
		const openapi = openApiParser.parse(this.schema);

		const serversParser = new ServersParser();
		const servers = serversParser.parse(this.schema);

		this.api = {
			openapi,
			servers
		};
	}

	mock() {

		this.server
			.setServers(this.api.servers)
			.setPort(this.port)
			.init();

	}

}

module.exports = OpenApiMocker;
