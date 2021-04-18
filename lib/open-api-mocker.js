'use strict';

const jsonRefs = require('json-refs');

const { Parser: OpenApiParser } = require('./openapi');
const { Parser: ServersParser } = require('./servers');
const { Parser: PathsParser } = require('./paths');
const LocalSchemaLoader = require('./schema-loaders/local-loader');
const OpenAPISchemaInvalid = require('./errors/openapi-schema-invalid-error');

const optionsBuilder = require('./utils/options-builder');
const ExplicitSchemaLoader = require('./schema-loaders/explicit-loader');

class OpenApiMocker {

	constructor(options) {
		this.options = optionsBuilder(options);

		if(this.options.schema)
			this.setSchema(this.options.schema);
	}

	setSchema(schema) {

		if(!this.schemaLoader) {
			if(this.options.schemaLoader)
				this.schemaLoader = this.options.schemaLoader;
			else if(typeof schema === 'string')
				this.schemaLoader = new LocalSchemaLoader();
			else
				this.schemaLoader = new ExplicitSchemaLoader();
		}

		this.schema = this.schemaLoader.load(schema);
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
		await this.options.server
			.setServers(this.api.servers)
			.setPort(this.options.port)
			.setPaths(this.api.paths)
			.init();

		if(this.options.watch && this.schemaLoader.watch && !this.options.alreadyWatching) {
			this.options.alreadyWatching = true;
			this.schemaLoader.on('schema-changed', () => {
				this.setSchema(this.options.schema);
				this.validate().then(() => this.mock());
			});
			this.schemaLoader.watch();
		}
	}

	shutdown() {
		return this.options.server.shutdown();
	}

}

module.exports = OpenApiMocker;
