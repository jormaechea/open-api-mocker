'use strict';

const assert = require('assert');

const SecuritySchemesStruct = require('../../lib/components/security-schemes/structs');

describe('Components', () => {

	describe('Security schemes', () => {

		describe('OAuth2', () => {

			it('Should fail if the security scheme has invalid required properties', () => {

				assert.throws(() => SecuritySchemesStruct({
					type: 'oauth2',
					flows: []
				}), {
					path: ['type'] // This should be a flows but it breaks in superstruct 0.6.1
				});
			});

			it('Should pass if the security scheme has the required properties', () => {

				SecuritySchemesStruct({
					type: 'oauth2',
					flows: {}
				});
			});

			it('Should pass if the security scheme has the required properties and valid optional properties', () => {

				SecuritySchemesStruct({
					type: 'oauth2',
					flows: {
						implicit: {
							authorizationUrl: 'https://oauth2.example.com/authorization',
							refreshUrl: 'https://oauth2.example.com/refresh',
							scopes: {
								scope1: 'Some scope description'
							}
						},
						password: {
							refreshUrl: 'https://oauth2.example.com/refresh',
							scopes: {
								scope1: 'Some scope description'
							},
							tokenUrl: 'https://oauth2.example.com/token'
						},
						clientCredentials: {
							refreshUrl: 'https://oauth2.example.com/refresh',
							scopes: {
								scope1: 'Some scope description'
							},
							tokenUrl: 'https://oauth2.example.com/token'
						},
						authorizationCode: {
							authorizationUrl: 'https://oauth2.example.com/authorization',
							refreshUrl: 'https://oauth2.example.com/refresh',
							scopes: {
								scope1: 'Some scope description'
							},
							tokenUrl: 'https://oauth2.example.com/token'
						}
					},
					description: 'Some description'
				});
			});

			it('Should throw if any optional property is invalid', () => {

				assert.throws(() => SecuritySchemesStruct({
					type: 'oauth2',
					flows: {
						implicit: {
							authorizationUrl: 'https://oauth2.example.com/authorization',
							refreshUrl: 'https://oauth2.example.com/refresh'
						}
					},
					description: 'Some description'
				}), {
					path: ['type'] // This should be a [flows, implicit] or [flows, implicit, scopes] but it breaks in superstruct 0.6.1
				});
			});

			it('Should allow and maintain the specification extension properties', () => {

				const securityScheme = {
					type: 'oauth2',
					flows: {},
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
