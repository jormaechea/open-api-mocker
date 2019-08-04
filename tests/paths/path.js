'use strict';

const assert = require('assert');

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
				parameters: undefined,
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
				body: {
					message: 'Unauthorized'
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
				body: {
					hello: 'world'
				}
			});
		});
	});

});
