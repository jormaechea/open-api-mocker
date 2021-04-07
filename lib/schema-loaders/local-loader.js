'use strict';

const fs = require('fs');
const path = require('path');
const YAML = require('js-yaml');
const chokidar = require('chokidar');
const EventEmitter = require('events');
const logger = require('lllog')();

const OpenAPISchemaNotFound = require('../errors/openapi-schema-not-found-error');
const OpenAPISchemaMalformed = require('../errors/openapi-schema-malformed-error');

module.exports = class LocalSchemaLoader extends EventEmitter {

	constructor(schemaPath) {
		super();
		this.schemaPath = path.isAbsolute(schemaPath) ? schemaPath : path.join(process.cwd(), schemaPath);
	}

	load() {

		try {
			fs.accessSync(this.schemaPath, fs.constants.R_OK);
		} catch(e) {
			throw new OpenAPISchemaNotFound(`Schema not found in ${this.schemaPath}`);
		}

		if(this.schemaPath.match(/\.ya?ml$/)) {
			try {
				return YAML.load(fs.readFileSync(this.schemaPath));
			} catch(e) {
				throw new OpenAPISchemaMalformed(e.message);
			}
		}

		delete require.cache[require.resolve(this.schemaPath)];
		try {
			return require(this.schemaPath); // eslint-disable-line global-require, import/no-dynamic-require
		} catch(e) {
			throw new OpenAPISchemaMalformed(e.message);
		}
	}

	watch() {
		logger.info('Watching changes...');
		chokidar.watch(this.schemaPath)
			.on('change', () => {
				setTimeout(async () => {
					const newSchema = this.load();
					this.emit('schema-changed', newSchema);
				}, 100);
			});
	}

};