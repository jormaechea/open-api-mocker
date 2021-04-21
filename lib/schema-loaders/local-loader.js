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

	load(schemaPath) {

		this.schemaPath = path.isAbsolute(schemaPath) ? schemaPath : path.join(process.cwd(), schemaPath);

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

		try {
			return JSON.parse(fs.readFileSync(this.schemaPath));
		} catch(e) {
			throw new OpenAPISchemaMalformed(e.message);
		}
	}

	watch() {
		logger.info('Watching changes...');
		chokidar.watch(this.schemaPath)
			.on('change', () => {
				setTimeout(async () => this.emit('schema-changed'), 100);
			});
	}

};
