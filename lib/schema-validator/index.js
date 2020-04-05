'use strict';

const Ajv = require('ajv');

const ajv = new Ajv({ unknownFormats: ['password'] });

class SchemaValidator {

	static validate(data, schema) {
		return !ajv.validate(schema, data) ? ajv.errors : [];
	}

}

module.exports = SchemaValidator;
