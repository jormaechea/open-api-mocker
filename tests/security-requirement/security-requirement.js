'use strict';

const assert = require('assert');

const ParserError = require('../../lib/errors/parser-error');
const { Parser, SecurityRequirement } = require('../../lib/security-requirement');

describe('SecurityRequirement', () => {

	describe('Schema parse', () => {

		const parser = new Parser();

		it('Should return an empty array if security is not defined', () => {

			const security = parser.parse({});

			assert.deepStrictEqual(security, []);
		});

		it('Should return an empty array if security is an empty array', () => {

			const security = parser.parse({
				security: []
			});

			assert.deepStrictEqual(security, []);
		});

		it('Should throw a ParserError if security is not an array', () => {

			const schema = {
				security: 'I\'m not an array'
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should throw a ParserError if at least one security requirement is not valid', () => {

			const schema = {
				security: [
					{
						'oauth-token': ['some:scope']
					},
					{
						'x-api-key': 0
					}
				]
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should return an array with the correct security requirement if one security requirement is defined only without scopes', () => {

			const schema = {
				security: [{
					'x-api-key': []
				}]
			};

			const security = parser.parse(schema);

			const expectedSecurityRequirements = new SecurityRequirement(schema.security[0]);

			assert.deepStrictEqual(security, [expectedSecurityRequirements]);
		});

		it('Should return an array of both security requirements if two security requirements without variables are defined', () => {

			const schema = {
				security: [
					{
						'x-api-key': [],
						'x-api-token': []
					},
					{
						'oauth-token': ['some:scope']
					}
				]
			};

			const security = parser.parse(schema);

			const expectedSecurityRequirement1 = new SecurityRequirement(schema.security[0]);
			const expectedSecurityRequirement2 = new SecurityRequirement(schema.security[1]);

			assert.deepStrictEqual(security, [expectedSecurityRequirement1, expectedSecurityRequirement2]);
		});

	});

});
