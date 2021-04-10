'use strict';

const assert = require('assert');

const CliErrorCodes = require('../../lib/errors/cli-error-codes');
const OpenAPISchemaInvalid = require('../../lib/errors/openapi-schema-invalid-error');
const OpenAPISchemaMalformed = require('../../lib/errors/openapi-schema-malformed-error');
const OpenAPISchemaNotFound = require('../../lib/errors/openapi-schema-not-found-error');

describe('Errors', () => {

	describe('OpenAPISchemaInvalid error', () => {
		it('Should return the correct CLI error code', () => {
			const error = new OpenAPISchemaInvalid();
			assert.strictEqual(error.cliError, CliErrorCodes.SCHEMA_INVALID);
		});
	});

	describe('OpenAPISchemaMalformed error', () => {
		it('Should return the correct CLI error code', () => {
			const error = new OpenAPISchemaMalformed();
			assert.strictEqual(error.cliError, CliErrorCodes.SCHEMA_MALFORMED);
		});
	});

	describe('OpenAPISchemaNotFound error', () => {
		it('Should return the correct CLI error code', () => {
			const error = new OpenAPISchemaNotFound();
			assert.strictEqual(error.cliError, CliErrorCodes.SCHEMA_NOT_FOUND);
		});
	});

});
