'use strict';

const assert = require('assert');

const ParserError = require('../../lib/errors/parser-error');
const { Parser, Components } = require('../../lib/components');

describe('Components', () => {

	describe('Schema parse', () => {

		const parser = new Parser();

		it('Should return the Components object if components is not defined', () => {

			const schema = {};

			const components = parser.parse(schema);

			const expectedComponents = new Components({});

			assert.deepStrictEqual(components, expectedComponents);
		});

		it('Should return the Components object if components is an empty object', () => {

			const schema = { components: {} };

			const components = parser.parse(schema);

			const expectedComponents = new Components({});

			assert.deepStrictEqual(components, expectedComponents);
		});

		it('Should throw a ParserError if components is an not an object', () => {

			const schema = { components: [] };

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should not set an schema type if it has the oneOf property set', () => {

			const schema = {
				components: {
					schemas: {
						FooSchema: {
							type: 'object',
							properties: {
								id: {
									oneOf: [
										{ type: 'string' },
										{ type: 'number' }
									]
								}
							}
						}
					}
				}
			};

			const components = parser.parse(schema);
			assert.deepStrictEqual(components.schemas.FooSchema.properties.id.type, undefined);
		});

		it('Should mantain the specification extension properties', () => {

			const schema = {
				components: {
					'x-foo': 'bar',
					'x-baz': {
						test: [1, 2, 3]
					}
				}
			};

			const components = parser.parse(schema);

			const expectedComponents = new Components(schema.components, [
				['x-foo', 'bar'],
				['x-baz', { test: [1, 2, 3] }]
			]);

			assert.deepStrictEqual(components, expectedComponents);
		});

	});

});
