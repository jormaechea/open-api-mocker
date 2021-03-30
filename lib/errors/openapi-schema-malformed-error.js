'use strict';

const { SCHEMA_MALFORMED } = require('./cli-error-codes');

module.exports = class OpenAPISchemaMalformed extends Error {
	get cliError() {
		return SCHEMA_MALFORMED;
	}
};
