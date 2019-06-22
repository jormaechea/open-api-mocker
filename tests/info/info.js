'use strict';

const assert = require('assert');

const ParserError = require('../../lib/errors/parser-error');
const { Parser, Info } = require('../../lib/info');

describe('Info', () => {

	describe('Schema parse', () => {

		const parser = new Parser();

		it('Should throw a ParserError if info is not defined', () => {

			const schema = {};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should throw a ParserError if info is not an object', () => {

			const schema = {
				info: 'I\'m a string'
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should throw a ParserError if info.title is not defined', () => {

			const schema = {
				info: {}
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should throw a ParserError if info.version is not defined', () => {

			const schema = {
				info: {
					title: 'My API'
				}
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should throw a ParserError if info.contact is not defined but not as object', () => {

			const schema = {
				info: {
					title: 'My API',
					version: '1.0.0',
					contact: 'john.doe@example.com'
				}
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should throw a ParserError if info.license is defined but not as object', () => {

			const schema = {
				info: {
					title: 'My API',
					version: '1.0.0',
					license: 'MIT'
				}
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should throw a ParserError if info.license is defined without a name', () => {

			const schema = {
				info: {
					title: 'My API',
					version: '1.0.0',
					license: {
						url: 'https://example.com/license'
					}
				}
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should return the Info object if info is defined with minimal fields', () => {

			const schema = {
				info: {
					title: 'My API',
					version: '1.0.0'
				}
			};

			const info = parser.parse(schema);

			const expectedInfo = new Info(schema.info);

			assert.deepStrictEqual(info, expectedInfo);
		});

		it('Should return the Info object if info is defined with every field', () => {

			const schema = {
				info: {
					title: 'My API',
					version: '1.0.0',
					contact: {
						name: 'John Doe',
						url: 'https://example.com/contact',
						email: 'john.doe@example.com'
					},
					license: {
						name: 'MIT',
						url: 'https://example.com/license'
					}
				}
			};

			const info = parser.parse(schema);

			const expectedInfo = new Info(schema.info);

			assert.deepStrictEqual(info, expectedInfo);
		});

		it('Should mantain the specification extension properties', () => {

			const schema = {
				info: {
					title: 'My API',
					version: '1.0.0',
					'x-foo': 'bar',
					'x-baz': {
						test: [1, 2, 3]
					}
				}
			};

			const info = parser.parse(schema);

			const expectedInfo = new Info(schema.info, [
				['x-foo', 'bar'],
				['x-baz', { test: [1, 2, 3] }]
			]);

			assert.deepStrictEqual(info, expectedInfo);
		});

	});

});
