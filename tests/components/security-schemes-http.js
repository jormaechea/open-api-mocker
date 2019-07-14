'use strict';

const assert = require('assert');

const SecuritySchemesStruct = require('../../lib/components/security-schemes/structs');

describe('Components', () => {

	describe('Security schemes', () => {

		describe('Http', () => {

			it('Should pass if the security scheme has the required properties', () => {

				SecuritySchemesStruct({
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'jwt'
				});

				SecuritySchemesStruct({
					type: 'http',
					scheme: 'otherScheme'
				});
			});

			it('Should fail if the security scheme has forbidden properties', () => {

				assert.throws(() => SecuritySchemesStruct({
					type: 'http',
					scheme: 'otherScheme',
					bearerFormat: 'jwt'
				}), {
					path: ['type'] // This should be a bearerFormat but it breaks in superstruct 0.6.1
				});
			});

			it('Should pass if the security scheme has the required properties and valid optional properties', () => {

				SecuritySchemesStruct({
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'jwt',
					description: 'Some description'
				});

				SecuritySchemesStruct({
					type: 'http',
					scheme: 'otherScheme',
					description: 'Some description'
				});
			});

			it('Should allow and maintain the specification extension properties', () => {

				const securityScheme = {
					type: 'http',
					scheme: 'otherScheme',
					'x-foo': 'bar',
					'x-baz': {
						test: [1, 2, 3]
					}
				};

				const result = SecuritySchemesStruct(securityScheme);

				assert.strictEqual(result['x-foo'], 'bar');
				assert.deepStrictEqual(result['x-baz'], { test: [1, 2, 3] });
			});
		});
	});
});
