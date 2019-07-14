'use strict';

const assert = require('assert');

const SecuritySchemesStruct = require('../../lib/components/security-schemes/structs');

describe('Components', () => {

	describe('Security schemes', () => {

		describe('Open ID', () => {

			it('Should pass if the security scheme has the required properties', () => {

				SecuritySchemesStruct({
					type: 'openIdConnect',
					openIdConnectUrl: 'https://openid.example.com'
				});
			});

			it('Should pass if the security scheme has the required properties and valid optional properties', () => {

				SecuritySchemesStruct({
					type: 'openIdConnect',
					openIdConnectUrl: 'https://openid.example.com',
					description: 'Some description'
				});
			});

			it('Should allow and maintain the specification extension properties', () => {

				const securityScheme = {
					type: 'openIdConnect',
					openIdConnectUrl: 'https://openid.example.com',
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
