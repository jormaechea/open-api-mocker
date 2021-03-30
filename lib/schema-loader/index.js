'use strict';

const chokidar = require('chokidar');
const fs = require('fs');
const YAML = require('js-yaml');
const EventEmitter = require('events');

/**
 * @emits loaded
 */
class DefaultSchemaLoader extends EventEmitter {
	/**
	 * @param {Object} options
	 * @param {string} options.schemaPath	The path to the file to load on disk. Can be .json or .yml/yaml
	 * @param {boolean} [options.watch]		Whether to watch the file for changes.
	 */
	setOptions(options) {
		if(!options)
			throw new Error('Options cannot be undefined');

		if(!options.schemaPath)
			throw new Error('The `schemaPath` option must be provided');

		this.options = options;
	}

	_loadFile() {
		return new Promise((resolve, reject) => {
			const { schemaPath } = this.options;
			let schema;

			try {
				if(schemaPath.match(/\.ya?ml$/))
					schema = YAML.load(fs.readFileSync(schemaPath));
				else {
					delete require.cache[require.resolve(schemaPath)];
					schema = require(schemaPath); // eslint-disable-line global-require, import/no-dynamic-require
				}
			} catch(e) {
				reject(new Error(`Could not parse schema at ${schemaPath}: ${e.message}`));
			}

			/**
			 * Loaded event.
			 *
			 * @event loaded
			 * @type {object} the loaded schema file
			 */
			this.emit('loaded', schema);

			resolve(schema);
		});
	}

	load() {
		const { schemaPath, watch } = this.options;

		if(watch) {
			chokidar.watch(schemaPath).on('change', () => {
				setTimeout(() => { this._loadFile(); }, 100);
			});
		}

		return this._loadFile();
	}
}

module.exports = DefaultSchemaLoader;
