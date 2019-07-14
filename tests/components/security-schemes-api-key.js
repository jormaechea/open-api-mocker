'use strict';

const assert = require('assert');

const SecuritySchemesStruct = require('../../lib/components/security-schemes/structs');

describe('Components', () => {

	describe('Security schemes', () => {

		describe('API key', () => {

			it('Should pass if the security scheme has the required properties', () => {

				const securityScheme = {
					type: 'apiKey',
					name: 'x-api-key',
					in: 'header'
				};

				SecuritySchemesStruct(securityScheme);
			});

			it('Should pass if the security scheme has the required properties and valid optional properties', () => {

				SecuritySchemesStruct({
					type: 'apiKey',
					name: 'x-api-key',
					in: 'header',
					description: 'Some description'
				});

				SecuritySchemesStruct({
					type: 'apiKey',
					name: 'token',
					in: 'query',
					description: 'Some description'
				});

				SecuritySchemesStruct({
					type: 'apiKey',
					name: 'Authorization',
					in: 'cookie',
					description: 'Some description'
				});
			});

			it('Should allow and maintain the specification extension properties', () => {

				const securityScheme = {
					type: 'apiKey',
					name: 'x-api-key',
					in: 'header',
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
