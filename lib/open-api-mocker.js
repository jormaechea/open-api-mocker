'use strict';

const jsonRefs = require('json-refs');

const { Parser: OpenApiParser } = require('./openapi');
const { Parser: ServersParser } = require('./servers');
const { Parser: PathsParser } = require('./paths');
const LocalSchemaLoader = require('./schema-loaders/local-loader');
const OpenAPISchemaInvalid = require('./errors/openapi-schema-invalid-error');

class OpenApiMocker {

	static get defaultPort() {
		return 5000;
	}

	constructor({ port, schema, watch, server }) {
		// Legacy handling of string based server that loads a server implementation based on folder name
		if(typeof server === 'string' || server == null) {
			// eslint-disable-next-line global-require, import/no-dynamic-require
			const Server = require(`./mocker/${server || 'express'}/server`);
			server = new Server();
		}

		this.server = server;
		this.port = port || this.constructor.defaultPort;

		if(schema)
			this.setSchema(schema);

		this.watch = !!watch;
		this.alreadyWatching = false;
	}

	setSchema(schema) {
		if(typeof schema === 'string') {
			this.schemaLoader = new LocalSchemaLoader(schema);
			this.schema = this.schemaLoader.load();
		} else
			this.schema = schema;
	}

	async validate() {

		// In case schema loader is async and returns a Promise
		if(this.schema instanceof Promise)
			this.schema = await this.schema;

		try {
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
		} catch(e) {
			throw new OpenAPISchemaInvalid(e.message);
		}
	}

	async mock() {
		await this.server
			.setServers(this.api.servers)
			.setPort(this.port)
			.setPaths(this.api.paths)
			.init();

		if(this.watch && this.schemaLoader && !this.alreadyWatching) {
			this.alreadyWatching = true;
			this.schemaLoader.on('schema-changed', schema => {
				this.setSchema(schema);
				this.validate().then(() => this.mock());
			});
			this.schemaLoader.watch();
		}
	}

	shutdown() {
		return this.server.shutdown();
	}

}

module.exports = OpenApiMocker;
