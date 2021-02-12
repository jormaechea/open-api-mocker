'use strict';

const assert = require('assert');
const sinon = require('sinon');

const ParserError = require('../../lib/errors/parser-error');
const { Parser, Path } = require('../../lib/paths');

describe('Paths', () => {

	describe('Schema parse', () => {

		const parser = new Parser();

		it('Should return an empty array if paths is not defined', () => {

			const paths = parser.parse({});

			assert.deepStrictEqual(paths, []);
		});

		it('Should return an empty array if paths is an empty object', () => {

			const paths = parser.parse({
				paths: {}
			});

			assert.deepStrictEqual(paths, []);
		});

		it('Should throw a ParserError if paths is not an object', () => {

			const schema = {
				paths: 'I\'m not an object'
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should throw a ParserError if at least one path is not valid', () => {

			const schema = {
				paths: {
					'/hello': {},
					'/hello-world': []
				}
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should return an empty array if no operations are defined', () => {

			const paths = parser.parse({
				paths: {
					'/hello': {}
				}
			});

			assert.deepStrictEqual(paths, []);
		});

		it('Should return an array with the correct paths if one valid operation is defined', () => {

			const paths = parser.parse({
				paths: {
					'/hello': {
						get: {
							responses: {
								200: { description: 'OK' }
							}
						}
					}
				}
			});

			const expectedPath = new Path({
				uri: '/hello',
				httpMethod: 'get',
				parameters: undefined,
				responses: {
					200: { description: 'OK' }
				}
			});

			assert.deepStrictEqual(paths, [expectedPath]);
		});

		it('Should return an array of both paths if two valid paths and operations are defined', () => {

			const paths = parser.parse({
				paths: {
					'/hello': {
						summary: 'Get a hello',
						description: 'Use this API if you want to be greeted',
						parameters: [
							{
								name: 'name',
								in: 'query'
							}
						],
						get: {
							responses: {
								200: { description: 'OK' }
							}
						}
					},
					'/bye': {
						post: {
							parameters: [
								{
									name: 'name',
									in: 'query'
								}
							],
							responses: {
								401: { description: 'Unauthorized' }
							}
						}
					}
				}
			});

			const expectedPath1 = new Path({
				uri: '/hello',
				httpMethod: 'get',
				parameters: [
					{
						name: 'name',
						in: 'query',
						deprecated: false,
						required: false
					}
				],
				responses: {
					200: { description: 'OK' }
				}
			});

			const expectedPath2 = new Path({
				uri: '/bye',
				httpMethod: 'post',
				parameters: [
					{
						name: 'name',
						in: 'query',
						deprecated: false,
						required: false
					}
				],
				responses: {
					401: { description: 'Unauthorized' }
				}
			});

			assert.deepStrictEqual(paths, [expectedPath1, expectedPath2]);
		});
	});

	describe('Request validation', () => {

		it('Should pass validation if parameters is not set', () => {

			const path = new Path({
				uri: '/hello',
				httpMethod: 'get'
			});

			const validation = path.validateRequestParameters({});
			assert.deepStrictEqual(validation, []);
		});

		it('Should pass validation if parameters is empty', () => {

			const path = new Path({
				uri: '/hello',
				httpMethod: 'get',
				parameters: []
			});

			const validation = path.validateRequestParameters({});
			assert.deepStrictEqual(validation, []);
		});

		it('Should fail validation if a parameter has an invalid \'in\' property', () => {

			const path = new Path({
				uri: '/hello',
				httpMethod: 'get',
				parameters: [
					{
						in: 'unknown',
						name: 'x-foo'
					}
				]
			});

			const validation = path.validateRequestParameters({
				headers: {}
			});

			sinon.assert.match(validation, [sinon.match.string]);
		});

		context('Headers validation', () => {

			it('Should fail for a missing required header', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'header',
							name: 'x-foo',
							required: true,
							schema: {
								type: 'string'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					headers: {}
				});

				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should pass for a missing optional header', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'header',
							name: 'x-foo',
							schema: {
								type: 'string'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					headers: {}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should pass for a present header without schema', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'header',
							name: 'x-foo',
							required: true
						}
					]
				});

				const validation = path.validateRequestParameters({
					headers: {
						'x-foo': 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should pass for a present header without type', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'header',
							name: 'x-foo',
							required: true,
							schema: {}
						}
					]
				});

				const validation = path.validateRequestParameters({
					headers: {
						'x-foo': 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should fail for a present header that does not match an enum', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'header',
							name: 'x-foo',
							required: true,
							schema: {
								type: 'string',
								enum: ['foo', 'moreFoo']
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					headers: {
						'x-foo': 'bar'
					}
				});

				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should pass for a present header that matches the type', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'header',
							name: 'x-foo',
							required: true,
							schema: {
								type: 'string'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					headers: {
						'x-foo': 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should pass for a present header that matches the type and enum', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'header',
							name: 'x-foo',
							required: true,
							schema: {
								type: 'string',
								enum: ['foo', 'bar']
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					headers: {
						'x-foo': 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should pass for a present and deprecated header that matches the type', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'header',
							name: 'x-foo',
							required: true,
							deprecated: true,
							schema: {
								type: 'string'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					headers: {
						'x-foo': 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});
		});

		context('Query string validation', () => {

			it('Should fail for a missing required query', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'string'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {}
				});

				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should pass for a missing optional query', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							schema: {
								type: 'string'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should pass for a present query without schema', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should pass for a present query without type', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should fail for a present query that does not match an enum', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'string',
								enum: ['foo', 'moreFoo']
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 'bar'
					}
				});

				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should pass for a present query that matches the type', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'string'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should pass for a present query that matches the type and enum', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'string',
								enum: ['foo', 'bar']
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should pass for a present and deprecated query that matches the type', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							deprecated: true,
							schema: {
								type: 'string'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});
		});

		context('Path validation', () => {

			it('Should fail for a missing required path', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'path',
							name: 'foo',
							required: true,
							schema: {
								type: 'string'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					path: {}
				});

				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should pass for a missing optional path', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'path',
							name: 'foo',
							schema: {
								type: 'string'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					path: {}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should pass for a present path without schema', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'path',
							name: 'foo',
							required: true
						}
					]
				});

				const validation = path.validateRequestParameters({
					path: {
						foo: 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should pass for a present path without type', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'path',
							name: 'foo',
							required: true,
							schema: {}
						}
					]
				});

				const validation = path.validateRequestParameters({
					path: {
						foo: 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should fail for a present path that does not match an enum', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'path',
							name: 'foo',
							required: true,
							schema: {
								type: 'string',
								enum: ['foo', 'moreFoo']
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					path: {
						foo: 'bar'
					}
				});

				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should pass for a present path that matches the type', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'path',
							name: 'foo',
							required: true,
							schema: {
								type: 'string'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					path: {
						foo: 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should pass for a present path that matches the type and enum', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'path',
							name: 'foo',
							required: true,
							schema: {
								type: 'string',
								enum: ['foo', 'bar']
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					path: {
						foo: 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});
		});

		context('Cookies validation', () => {

			it('Should fail for a missing required cookie', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'cookie',
							name: 'foo',
							required: true,
							schema: {
								type: 'string'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					cookies: {}
				});

				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should pass for a missing optional cookie', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'cookie',
							name: 'foo',
							schema: {
								type: 'string'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					cookies: {}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should pass for a present cookie without schema', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'cookie',
							name: 'foo',
							required: true
						}
					]
				});

				const validation = path.validateRequestParameters({
					cookies: {
						foo: 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should pass for a present cookie without type', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'cookie',
							name: 'foo',
							required: true,
							schema: {}
						}
					]
				});

				const validation = path.validateRequestParameters({
					cookies: {
						foo: 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should fail for a present cookie that does not match an enum', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'cookie',
							name: 'foo',
							required: true,
							schema: {
								type: 'string',
								enum: ['foo', 'moreFoo']
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					cookies: {
						foo: 'bar'
					}
				});

				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should pass for a present cookie that matches the type', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'cookie',
							name: 'foo',
							required: true,
							schema: {
								type: 'string'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					cookies: {
						foo: 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should pass for a present cookie that matches the type and enum', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'cookie',
							name: 'foo',
							required: true,
							schema: {
								type: 'string',
								enum: ['foo', 'bar']
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					cookies: {
						foo: 'bar'
					}
				});

				assert.deepStrictEqual(validation, []);
			});
		});

		context('Types validation', () => {

			it('Should pass for a valid array parameter value', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'array'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: ['bar', 'yeah']
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should fail for an object in an array parameter value', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'array'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: { bar: 'yeah' }
					}
				});

				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should pass for a valid object parameter value', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'object'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: { bar: 'yeah' }
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should fail for an array in an object parameter value', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'object'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: ['bar', 'yeah']
					}
				});

				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should fail for a string in an object parameter value', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'object'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 'bar'
					}
				});

				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should pass for a valid number parameter value', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'number'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 10
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should pass for a float in an number parameter value', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'number'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 10.5
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should fail for a string in an number parameter value', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'number'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 'bar'
					}
				});

				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should pass for a valid integer parameter value', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'integer'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 10
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should fail for a float in an integer parameter value', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'integer'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 10.5
					}
				});

				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should fail for a string in an integer parameter value', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'integer'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 'bar'
					}
				});

				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should pass for a valid boolean parameter value', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'boolean'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: true
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should fail for a string in a boolean parameter value', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'boolean'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 'bar'
					}
				});

				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should fail for an invalid parameter type', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'unknown'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 'bar'
					}
				});

				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should cast numbers for number parameters', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'number'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: '10'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should cast numbers for integer parameters', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'integer'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: '10'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should cast true boolean for boolean parameters', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'boolean'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 'true'
					}
				});

				assert.deepStrictEqual(validation, []);
			});

			it('Should cast false boolean for boolean parameters', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					parameters: [
						{
							in: 'query',
							name: 'foo',
							required: true,
							schema: {
								type: 'boolean'
							}
						}
					]
				});

				const validation = path.validateRequestParameters({
					query: {
						foo: 'false'
					}
				});

				assert.deepStrictEqual(validation, []);
			});
		});

		context('Body validation', () => {

			it('Should pass validation if requestBody is not set', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get'
				});

				const validation = path.validateRequestBody(undefined);
				assert.deepStrictEqual(validation, []);
			});

			it('Should pass validation if requestBody is not required and no body was received', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					requestBody: {
						required: false
					}
				});

				const validation = path.validateRequestBody(undefined);
				assert.deepStrictEqual(validation, []);
			});

			it('Should fail validation if requestBody is required and no body was received', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					requestBody: {
						required: true
					}
				});

				const validation = path.validateRequestBody(undefined);
				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should pass validation if requestBody has no content', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					requestBody: {
						required: true
					}
				});

				const validation = path.validateRequestBody({});
				assert.deepStrictEqual(validation, []);
			});

			it('Should pass validation if requestBody has no content for application/json', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					requestBody: {
						required: true,
						content: {
							'application/other': {
								schema: {}
							}
						}
					}
				});

				const validation = path.validateRequestBody({});
				assert.deepStrictEqual(validation, []);
			});

			it('Should pass validation if requestBody has no content schema for application/json', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					requestBody: {
						required: true,
						content: {
							'application/json': {}
						}
					}
				});

				const validation = path.validateRequestBody({});
				assert.deepStrictEqual(validation, []);
			});

			it('Should pass validation if requestBody type is matched (as object)', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'object'
								}
							}
						}
					}
				});

				const validation = path.validateRequestBody({});
				assert.deepStrictEqual(validation, []);
			});

			it('Should pass validation if requestBody type is matched (as array)', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'array'
								}
							}
						}
					}
				});

				const validation = path.validateRequestBody([]);
				assert.deepStrictEqual(validation, []);
			});

			it('Should fail validation if requestBody type is not matched', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'array'
								}
							}
						}
					}
				});

				const validation = path.validateRequestBody({});
				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should fail validation if requestBody type is invalid', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'somInvalidType'
								}
							}
						}
					}
				});

				const validation = path.validateRequestBody({});
				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should fail validation if requestBody has a missing required property', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										name: {
											type: 'string'
										},
										age: {
											type: 'integer'
										}
									},
									required: ['name']
								}
							}
						}
					}
				});

				const validation = path.validateRequestBody({});
				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should fail validation if requestBody has a property that does not match the schema', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										name: {
											type: 'string'
										},
										age: {
											type: 'integer'
										}
									},
									required: ['name']
								}
							}
						}
					}
				});

				const validation = path.validateRequestBody({
					name: 'John Doe',
					age: 'Not a valid date'
				});
				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should fail validation if requestBody has a property that does not match the schema with depth of 2', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										name: {
											type: 'string'
										},
										age: {
											type: 'integer'
										},
										pets: {
											type: 'array',
											items: {
												type: 'object',
												properties: {
													type: {
														type: 'string',
														enum: ['dog', 'cat']
													},
													nickname: {
														type: 'string'
													}
												}
											}
										}
									},
									required: ['name']
								}
							}
						}
					}
				});

				const validation = path.validateRequestBody({
					name: 'John Doe',
					pets: [
						{
							type: 'dog',
							nickname: 'Doggy'
						},
						{
							type: 'snake',
							nickname: 'Cobra'
						}
					]
				});
				sinon.assert.match(validation, [sinon.match.string]);
			});

			it('Should fail validation if all of the schemas of an oneOf are not valid', () => {

				const path = new Path({
					uri: '/hello',
					httpMethod: 'get',
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										name: {
											type: 'string'
										},
										age: {
											oneOf: [
												{ type: 'integer' },
												{ type: 'object' }
											]
										}
									},
									required: ['name']
								}
							}
						}
					}
				});

				const validation = path.validateRequestBody({
					name: 'John Doe',
					age: 'invalidAge'
				});

				// Three errors: one for integer, one for object and one for the oneOf
				sinon.assert.match(validation, [sinon.match.string, sinon.match.string, sinon.match.string]);
			});
		});
	});

	describe('Get response', () => {

		it('Should call the response generator with the first available response if no preferred statusCode is passed', () => {

			const path = new Path({
				uri: '/hello',
				httpMethod: 'get',
				parameters: undefined,
				responses: {
					200: {
						description: 'OK',
						content: {
							'application/json': {
								example: {
									hello: 'world'
								}
							}
						}
					}
				}
			});

			const response = path.getResponse();

			assert.deepStrictEqual(response, {
				statusCode: 200,
				headers: undefined,
				body: {
					hello: 'world'
				}
			});
		});

		it('Should call the response generator with the first available response with given example if no preferred statusCode is passed', () => {

			const path = new Path({
				uri: '/hello',
				httpMethod: 'get',
				parameters: undefined,
				responses: {
					200: {
						description: 'OK',
						content: {
							'application/json': {
								examples: {
									hello: {
										value: { hello: 'world' }
									},
									goodbye: {
										value: { goodbye: 'yellow brick road' }
									}
								}
							}
						}
					}
				}
			});

			const response = path.getResponse(undefined, 'goodbye');

			assert.deepStrictEqual(response, {
				statusCode: 200,
				headers: undefined,
				body: {
					goodbye: 'yellow brick road'
				}
			});
		});

		it('Should call the response generator with the first available response with prefer example & no prefered statusCode, but no match', () => {

			const path = new Path({
				uri: '/hello',
				httpMethod: 'get',
				parameters: undefined,
				responses: {
					200: {
						description: 'OK',
						content: {
							'application/json': {
								examples: {
									hello: {
										value: { hello: 'world' }
									},
									goodbye: {
										value: { goodbye: 'yellow brick road' }
									}
								}
							}
						}
					}
				}
			});

			const response = path.getResponse(undefined, 'sup');

			assert.deepStrictEqual(response, {
				statusCode: 200,
				headers: undefined,
				body: {
					hello: 'world'
				}
			});
		});

		it('Should call the response generator with the preferred response based on the passed statusCode', () => {

			const path = new Path({
				uri: '/hello',
				httpMethod: 'get',
				parameters: undefined,
				responses: {
					200: {
						description: 'OK',
						content: {
							'application/json': {
								example: {
									hello: 'world'
								}
							}
						}
					},
					401: {
						description: 'Unauthorized',
						content: {
							'application/json': {
								example: {
									message: 'Unauthorized'
								}
							}
						}
					}
				}
			});

			const response = path.getResponse('401');

			assert.deepStrictEqual(response, {
				statusCode: 401,
				headers: undefined,
				body: {
					message: 'Unauthorized'
				}
			});
		});

		it('Should call the response generator with the preferred response based on the passed statusCode and passed example', () => {

			const path = new Path({
				uri: '/hello',
				httpMethod: 'get',
				parameters: undefined,
				responses: {
					200: {
						description: 'OK',
						content: {
							'application/json': {
								example: {
									hello: 'world'
								}
							}
						}
					},
					401: {
						description: 'Unauthorized',
						content: {
							'application/json': {
								examples: {
									invalid: {
										value: {
											message: 'Unauthorized - token invalid'
										}
									},
									expired: {
										value: {
											message: 'Unauthorized - token expired'
										}
									}
								}
							}
						}
					}
				}
			});

			const response = path.getResponse('401', 'expired');

			assert.deepStrictEqual(response, {
				statusCode: 401,
				headers: undefined,
				body: {
					message: 'Unauthorized - token expired'
				}
			});
		});

		it('Should call the response generator with the first response if preferred response is not available', () => {

			const path = new Path({
				uri: '/hello',
				httpMethod: 'get',
				parameters: undefined,
				responses: {
					200: {
						description: 'OK',
						content: {
							'application/json': {
								example: {
									hello: 'world'
								}
							}
						}
					},
					401: {
						description: 'Unauthorized',
						content: {
							'application/json': {
								example: {
									message: 'Unauthorized'
								}
							}
						}
					}
				}
			});

			const response = path.getResponse('403');

			assert.deepStrictEqual(response, {
				statusCode: 200,
				headers: undefined,
				body: {
					hello: 'world'
				}
			});
		});

		it('Should not call the response generator with the preferred response based on the passed statusCode if response content is empty', () => {

			const path = new Path({
				uri: '/hello',
				httpMethod: 'get',
				parameters: undefined,
				responses: {
					200: {
						description: 'OK',
						content: {
							'application/json': {
								example: {
									hello: 'world'
								}
							}
						}
					},
					401: {
						description: 'Unauthorized'
					}
				}
			});

			const response = path.getResponse('401');

			assert.deepStrictEqual(response, {
				statusCode: 401,
				headers: undefined,
				body: null
			});
		});

		it('Should not call the response generator with the first response if response content is empty', () => {

			const path = new Path({
				uri: '/hello',
				httpMethod: 'get',
				parameters: undefined,
				responses: {
					200: {
						description: 'OK'
					},
					401: {
						description: 'Unauthorized',
						content: {
							'application/json': {
								example: {
									message: 'Unauthorized'
								}
							}
						}
					}
				}
			});

			const response = path.getResponse('403');

			assert.deepStrictEqual(response, {
				statusCode: 200,
				headers: undefined,
				body: null
			});
		});

		it('Should generate the response with the response\'s headers', () => {

			const path = new Path({
				uri: '/hello',
				httpMethod: 'get',
				parameters: undefined,
				responses: {
					200: {
						description: 'OK',
						headers: {
							'x-foo': {
								schema: {
									type: 'string',
									example: 'bar'
								}
							},
							'x-more-foo': {
								schema: {
									type: 'string',
									example: 'baz'
								}
							}
						},
						content: {
							'application/json': {
								example: {
									hello: 'world'
								}
							}
						}
					}
				}
			});

			const response = path.getResponse();

			assert.deepStrictEqual(response, {
				statusCode: 200,
				headers: {
					'x-foo': 'bar',
					'x-more-foo': 'baz'
				},
				body: {
					hello: 'world'
				}
			});
		});
	});

});
