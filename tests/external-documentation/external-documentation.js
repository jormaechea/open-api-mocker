'use strict';

const assert = require('assert');

const ParserError = require('../../lib/errors/parser-error');
const { Parser, ExternalDocumentation } = require('../../lib/external-documentation');

describe('ExternalDocumentation', () => {

	describe('Schema parse', () => {

		const parser = new Parser();

		it('Should return an empty ExternalDocumentation instance if externalDocs is not defined', () => {

			const schema = {};

			const externalDocs = parser.parse(schema);

			const expectedExternalDocumentation = new ExternalDocumentation({});

			assert.deepStrictEqual(externalDocs, expectedExternalDocumentation);
		});

		it('Should throw a ParserError if externalDocs is not an object', () => {

			const schema = {
				externalDocs: 'I\'m a string'
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should throw a ParserError if externalDocs.url is not defined', () => {

			const schema = {
				externalDocs: {
					description: 'The documentation description'
				}
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should throw a ParserError if externalDocs.url is defined but not as a string', () => {

			const schema = {
				externalDocs: {
					url: ['https://api.example.com/docs']
				}
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should return the ExternalDocumentation object if externalDocs is defined with minimal fields', () => {

			const schema = {
				externalDocs: {
					url: 'https://api.example.com/docs'
				}
			};

			const externalDocs = parser.parse(schema);

			const expectedExternalDocumentation = new ExternalDocumentation(schema.externalDocs);

			assert.deepStrictEqual(externalDocs, expectedExternalDocumentation);
		});

		it('Should return the ExternalDocumentation object if externalDocs is defined with every field', () => {

			const schema = {
				externalDocs: {
					url: 'https://api.example.com/docs',
					description: 'The documentation description'
				}
			};

			const externalDocs = parser.parse(schema);

			const expectedExternalDocumentation = new ExternalDocumentation(schema.externalDocs);

			assert.deepStrictEqual(externalDocs, expectedExternalDocumentation);
		});

		it('Should mantain the specification extension properties', () => {

			const schema = {
				externalDocs: {
					url: 'https://api.example.com/docs',
					description: 'The documentation description',
					'x-foo': 'bar',
					'x-baz': {
						test: [1, 2, 3]
					}
				}
			};

			const externalDocs = parser.parse(schema);

			const expectedExternalDocumentation = new ExternalDocumentation(schema.externalDocs, [
				['x-foo', 'bar'],
				['x-baz', { test: [1, 2, 3] }]
			]);

			assert.deepStrictEqual(externalDocs, expectedExternalDocumentation);
		});

	});

});
