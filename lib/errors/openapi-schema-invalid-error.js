'use strict';

const { SCHEMA_INVALID } = require('./cli-error-codes');

module.exports = class OpenAPISchemaInvalid extends Error {

	constructor(message) {
		super(message);
		this.name = 'OpenAPISchemaInvalid';
	}

	get cliError() {
		return SCHEMA_INVALID;
	}
};
