'use strict';

const Ajv = require('ajv');

const ajv = new Ajv();

class SchemaValidator {

	static validate(data, schema) {
		return !ajv.validate(schema, data) ? ajv.errors : [];
	}

}

module.exports = SchemaValidator;
