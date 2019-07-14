'use strict';

const assert = require('assert');

const SecuritySchemesStruct = require('../../lib/components/security-schemes/structs');

describe('Components', () => {

	describe('Security schemes', () => {

		describe('Common structure', () => {

			it('Should throw if the security scheme is an not an object', () => {

				const securityScheme = [];

				assert.throws(() => SecuritySchemesStruct(securityScheme));
			});

			it('Should throw if the security scheme doesn\'t have the required properties', () => {

				const securityScheme = {};

				assert.throws(() => SecuritySchemesStruct(securityScheme));
			});

			it('Should throw if the security scheme has an invalid type property', () => {

				const securityScheme = {
					type: 'invalid'
				};

				assert.throws(() => SecuritySchemesStruct(securityScheme), {
					path: ['type']
				});
			});

			it('Should throw if any optional property is invalid', () => {

				const securityScheme = {
					type: 'apiKey'
				};

				assert.throws(() => SecuritySchemesStruct({
					...securityScheme,
					description: ['Invalid']
				}), {
					path: ['description']
				});
			});
		});
	});
});
