'use strict';

const assert = require('assert');

const ResponseStruct = require('../../lib/components/responses/structs');

describe('Components', () => {

	describe('Responses', () => {

		describe('Base structure', () => {

			it('Should throw if the response is an not an object', () => {

				const response = [];

				assert.throws(() => ResponseStruct(response));
			});

			it('Should throw if the response doesn\'t have the required properties', () => {

				const response = {};

				assert.throws(() => ResponseStruct(response));
			});

			it('Should throw if the response has an invalid description property', () => {

				const response = {
					description: ['Invalid']
				};

				assert.throws(() => ResponseStruct(response), {
					path: ['description']
				});
			});

			it('Should pass if the response has the required properties', () => {

				const response = {
					description: 'The description'
				};

				ResponseStruct(response);
			});

			it('Should allow and maintain the specification extension properties', () => {

				const response = {
					description: 'The description',
					'x-foo': 'bar',
					'x-baz': {
						test: [1, 2, 3]
					}
				};

				const result = ResponseStruct(response);

				assert.strictEqual(result['x-foo'], 'bar');
				assert.deepStrictEqual(result['x-baz'], { test: [1, 2, 3] });
			});
		});

		describe('Headers', () => {

			it('Should throw if the response has an invalid headers property', () => {

				const response = {
					description: 'The description',
					headers: 'Invalid'
				};

				assert.throws(() => ResponseStruct(response), {
					path: ['headers']
				});

				assert.throws(() => ResponseStruct({
					...response,
					headers: ['Invalid']
				}), {
					path: ['headers']
				});

				assert.throws(() => ResponseStruct({
					...response,
					headers: {
						headerName: {
							description: ['An invalid value']
						}
					}
				}), {
					path: ['headers', 'headerName', 'description']
				});
			});

			it('Should pass if the response has and empty object header', () => {

				const response = {
					description: 'The description',
					headers: {
						headerName: {}
					}
				};

				ResponseStruct(response);
			});

			it('Should pass if the response has a referenced header', () => {

				const response = {
					description: 'The description',
					headers: {
						headerName: {
							$ref: '#/some/ref'
						}
					}
				};

				ResponseStruct(response);
			});

			it('Should pass if the response has a complete object header', () => {

				const response = {
					description: 'The description',
					headers: {
						headerName: {
							description: 'Some header description',
							required: true,
							deprecated: false,
							style: 'simple',
							explode: false,
							schema: {
								$ref: '#some/ref'
							}
						}
					}
				};

				ResponseStruct(response);
			});

			it('Should set the response headers defaults', () => {

				const response = {
					description: 'The description',
					headers: {
						headerName: {}
					}
				};

				const result = ResponseStruct(response);

				assert.deepStrictEqual(result.headers.headerName, {
					required: false,
					deprecated: false,
					style: 'simple',
					explode: false
				});
			});

			it('Should allow and maintain the specification extension properties', () => {

				const response = {
					description: 'The description',
					headers: {
						headerName: {
							'x-foo': 'bar',
							'x-baz': {
								test: [1, 2, 3]
							}
						}
					}
				};

				const result = ResponseStruct(response);

				assert.strictEqual(result.headers.headerName['x-foo'], 'bar');
				assert.deepStrictEqual(result.headers.headerName['x-baz'], { test: [1, 2, 3] });
			});
		});

		describe('Content', () => {

			it('Should throw if the response has an invalid content property', () => {

				const response = {
					description: 'The description',
					content: 'Invalid'
				};

				assert.throws(() => ResponseStruct(response), {
					path: ['content']
				});

				assert.throws(() => ResponseStruct({
					...response,
					content: ['Invalid']
				}), {
					path: ['content']
				});

				assert.throws(() => ResponseStruct({
					...response,
					content: {
						'application/json': {
							schema: ['Invalid schema']
						}
					}
				}), {
					path: ['content', 'application/json', 'schema']
				});
			});

			it('Should pass if the response has and empty object content', () => {

				const response = {
					description: 'The description',
					content: {
						'application/json': {}
					}
				};

				ResponseStruct(response);
			});

			it('Should pass if the response has a referenced content', () => {

				const response = {
					description: 'The description',
					content: {
						'application/json': {
							schema: {
								$ref: '#/some/ref'
							}
						}
					}
				};

				ResponseStruct(response);
			});

			it('Should pass if the response has a complete object content', () => {

				const response = {
					description: 'The description',
					content: {
						'application/json': {
							schema: {
								type: 'string'
							}
						}
					}
				};

				ResponseStruct(response);
			});

			it('Should allow and maintain the specification extension properties', () => {

				const response = {
					description: 'The description',
					content: {
						'application/json': {
							'x-foo': 'bar',
							'x-baz': {
								test: [1, 2, 3]
							}
						}
					}
				};

				const result = ResponseStruct(response);

				assert.strictEqual(result.content['application/json']['x-foo'], 'bar');
				assert.deepStrictEqual(result.content['application/json']['x-baz'], { test: [1, 2, 3] });
			});
		});
	});
});
