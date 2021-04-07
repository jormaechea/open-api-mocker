'use strict';

const EventEmitter = require('events');

module.exports = class ExplicitSchemaLoader extends EventEmitter {

	constructor(schema) {
		super();
		this.schema = schema;
	}

	load() {
		return this.schema;
	}

	watch() {
	}

};
