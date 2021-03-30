'use strict';

const { SCHEMA_INVALID } = require('./cli-error-codes');

module.exports = class OpenAPISchemaInvalid extends Error {
	get cliError() {
		return SCHEMA_INVALID;
	}
};
