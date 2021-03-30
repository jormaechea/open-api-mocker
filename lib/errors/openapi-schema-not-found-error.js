'use strict';

const { SCHEMA_NOT_FOUND } = require('./cli-error-codes');

module.exports = class OpenAPISchemaNotFound extends Error {
	get cliError() {
		return SCHEMA_NOT_FOUND;
	}
};
