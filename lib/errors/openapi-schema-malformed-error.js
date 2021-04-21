'use strict';

const { SCHEMA_MALFORMED } = require('./cli-error-codes');

module.exports = class OpenAPISchemaMalformed extends Error {

	constructor(message) {
		super(message);
		this.name = 'OpenAPISchemaMalformed';
	}

	get cliError() {
		return SCHEMA_MALFORMED;
	}
};
