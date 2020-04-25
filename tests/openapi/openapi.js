'use strict';

const assert = require('assert');

const ParserError = require('../../lib/errors/parser-error');
const { Parser, Openapi } = require('../../lib/openapi');

describe('Openapi', () => {

	describe('Schema parse', () => {

		const parser = new Parser();

		it('Should throw a ParserError if openapi is not defined', () => {

			const schema = {};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should throw a ParserError if openapi is not a string', () => {

			const schema = {
				openapi: { foo: 'bar' }
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should throw a ParserError if openapi is not a valid version', () => {

			const schema = {
				openapi: '2.0.0'
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should return an array with the correct server if one server without variables is defined', () => {

			const openapi = parser.parse({
				openapi: '3.0.0'
			});

			const expectedOpenapi = new Openapi('3.0.0');

			assert.deepStrictEqual(openapi, expectedOpenapi);
		});

		it('Should pass for any 3.x version', () => {

			const openapi = parser.parse({
				openapi: '3.1.3'
			});

			const expectedOpenapi = new Openapi('3.1.3');

			assert.deepStrictEqual(openapi, expectedOpenapi);
		});

	});

});
