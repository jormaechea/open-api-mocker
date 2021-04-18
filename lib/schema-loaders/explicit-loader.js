'use strict';

const EventEmitter = require('events');

module.exports = class ExplicitSchemaLoader extends EventEmitter {

	load(schema) {
		return schema;
	}

};
