'use strict';

const jsonRefs = require('json-refs');

const DefaultSchemaLoader = require('./schema-loader');
const { Parser: OpenApiParser } = require('./openapi');
const { Parser: ServersParser } = require('./servers');
const { Parser: PathsParser } = require('./paths');

class OpenApiMocker {
	static get defaultPort() {
		return 5000;
	}

	constructor({ port, server = 'express', schemaLoader }) {
		// eslint-disable-next-line global-require, import/no-dynamic-require
		const Server = require(`./mocker/${server}/server`);

		this.schemaLoader = schemaLoader || new DefaultSchemaLoader();
		this.server = new Server();
		this.port = port || this.constructor.defaultPort;
		this._started = false;
	}

	setSchema(schema) {
		this.schema = schema;
		return this;
	}

	loadSchema(schemaLoaderOptions) {
		this.schemaLoader.setOptions(schemaLoaderOptions);

		this.schemaLoader.on('loaded', async schema => {
			this.setSchema(schema);
			await this.validate();

			if(this._started)
				await this.mock();
		});

		return this.schemaLoader.load();
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
		this._started = true;
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
