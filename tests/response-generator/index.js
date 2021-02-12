'use strict';

const assert = require('assert');

const ResponseGenerator = require('../../lib/response-generator');

describe('Response Generator', () => {

	describe('Generate', () => {

		it('Should return the example if it\'s defined', () => {

			const responseSchema = {
				example: {
					foo: 'bar'
				}
			};

			const response = ResponseGenerator.generate(responseSchema);

			assert.deepStrictEqual(response, {
				foo: 'bar'
			});
		});

		it('Should return the first example if examples is defined', () => {

			const responseSchema = {
				examples: {
					first: {
						value: {
							foo: 'bar'
						}
					}
				}
			};

			const response = ResponseGenerator.generate(responseSchema);

			assert.deepStrictEqual(response, {
				foo: 'bar'
			});
		});

		it('Should throw if examples is defined but example has no value', () => {

			const responseSchema = {
				examples: {
					first: {
						foo: 'bar'
					}
				}
			};

			assert.throws(() => ResponseGenerator.generate(responseSchema));
		});


		it('Should return the first example if examples is defined & preferred example value undefined', () => {

			const responseSchema = {
				examples: {
					first: {
						value: {
							yes: 'no'
						}
					},
					second: {
						hello: 'goodbye'
					}
				}
			};

			const response = ResponseGenerator.generate(responseSchema, 'second');

			assert.deepStrictEqual(response, {
				yes: 'no'
			});
		});

		it('Should return the preferred example if prefer header is set', () => {

			const responseSchema = {
				examples: {
					cat: {
						summary: 'An example of a cat',
						value: {
							name: 'Fluffy',
							petType: 'Cat',
							color: 'White',
							gender: 'male',
							breed: 'Persian'
						}
					},
					dog: {
						summary: 'An example of a dog with a cat\'s name',
						value: {
							name: 'Puma',
							petType: 'Dog',
							color: 'Black',
							gender: 'Female',
							breed: 'Mixed'
						}
					}
				}
			};

			const response = ResponseGenerator.generate(responseSchema, 'dog');

			assert.deepStrictEqual(response, {
				name: 'Puma',
				petType: 'Dog',
				color: 'Black',
				gender: 'Female',
				breed: 'Mixed'
			});
		});

		it('Should return the schema\'s example if it\'s defined', () => {

			const responseSchema = {
				schema: {
					example: {
						foo: 'bar'
					}
				}
			};

			const response = ResponseGenerator.generate(responseSchema);

			assert.deepStrictEqual(response, {
				foo: 'bar'
			});
		});

		it('Should return the schema\'s first example if examples is defined', () => {

			const responseSchema = {
				schema: {
					examples: [{
						foo: 'bar'
					}]
				}
			};

			const response = ResponseGenerator.generate(responseSchema);

			assert.deepStrictEqual(response, {
				foo: 'bar'
			});
		});

		it('Should return the first enum element if enum is defined', () => {

			const responseSchema = {
				enum: ['foo', 'bar', 'baz']
			};

			const response = ResponseGenerator.generate(responseSchema);

			assert.strictEqual(response, 'foo');
		});

		it('Should return a number if type is defined as number', () => {

			const responseSchema = {
				type: 'number'
			};

			const response = ResponseGenerator.generate(responseSchema);

			assert.strictEqual(typeof response, 'number');
		});

		it('Should return an integer if type is defined as integer', () => {

			const responseSchema = {
				type: 'integer'
			};

			const response = ResponseGenerator.generate(responseSchema);

			assert.strictEqual(typeof response, 'number');
			assert.strictEqual(response, response | 1);
		});

		it('Should return a not-empty array if type is defined as array', () => {

			const responseSchema = {
				type: 'array',
				items: {
					type: 'integer'
				}
			};

			const response = ResponseGenerator.generate(responseSchema);

			assert.strictEqual(typeof response, 'object');
			assert.ok(Array.isArray(response));
			assert.strictEqual(response[0], response[0] | 1);
		});

		it('Should return an empty object if type is defined as object without any other props', () => {

			const responseSchema = {
				type: 'object'
			};

			const response = ResponseGenerator.generate(responseSchema);

			assert.deepStrictEqual(response, {});
		});

		it('Should return the schema example if type is defined as object with an example property', () => {

			const responseSchema = {
				type: 'object',
				example: { foo: 'bar' }
			};

			const response = ResponseGenerator.generate(responseSchema);

			assert.deepStrictEqual(response, { foo: 'bar' });
		});

		it('Should return all schemas merged if the allOf property is defiend', () => {

			const responseSchema = {
				schema: {
					allOf: [
						{
							type: 'object',
							example: { foo: 'bar' }
						},
						{
							type: 'object',
							example: { baz: 'yeah' }
						}
					]
				}
			};

			const response = ResponseGenerator.generate(responseSchema);

			assert.deepStrictEqual(response, {
				foo: 'bar',
				baz: 'yeah'
			});
		});

		it('Should return the first schema if the oneOf property is defiend', () => {

			const responseSchema = {
				schema: {
					oneOf: [
						{
							type: 'object',
							example: { foo: 'bar' }
						},
						{
							type: 'object',
							example: { baz: 'yeah' }
						}
					]
				}
			};

			const response = ResponseGenerator.generate(responseSchema);

			assert.deepStrictEqual(response, {
				foo: 'bar'
			});
		});

		it('Should return the first schema if the anyOf property is defiend', () => {

			const responseSchema = {
				schema: {
					anyOf: [
						{
							type: 'object',
							example: { foo: 'bar' }
						},
						{
							type: 'object',
							example: { baz: 'yeah' }
						}
					]
				}
			};

			const response = ResponseGenerator.generate(responseSchema);

			assert.deepStrictEqual(response, {
				foo: 'bar'
			});
		});

		it('Should throw if an invalid type is defined', () => {

			const responseSchema = {
				type: 'invalidType'
			};

			assert.throws(() => ResponseGenerator.generate(responseSchema));
		});

		it('Should throw if an invalid schema is passed', () => {

			const responseSchema = {};

			assert.throws(() => ResponseGenerator.generate(responseSchema));
		});

		it('Should return a generated response if a complex schema is defined', () => {

			const responseSchema = {
				schema: {
					type: 'object',
					properties: {
						foo: {
							type: 'string'
						},
						bar: {
							type: 'array',
							items: {
								type: 'number'
							}
						},
						baz: {
							type: 'boolean'
						},
						yeah: {
							type: 'object',
							properties: {
								test1: {
									type: 'string',
									example: 'Hi'
								},
								test2: {
									type: 'array',
									items: {
										type: 'number',
										enum: [10, 20, 30]
									}
								}
							}
						},
						employee: {
							schema: {
								allOf: [
									{
										type: 'object',
										properties: {
											name: {
												type: 'string',
												example: 'John'
											},
											age: {
												type: 'integer',
												example: 30
											}
										}
									},
									{
										type: 'object',
										properties: {
											employeeId: {
												type: 'string',
												example: '0001222-B'
											}
										}
									}
								]
							}
						}
					}
				}
			};

			const response = ResponseGenerator.generate(responseSchema);

			assert.deepStrictEqual(response, {
				foo: 'string',
				bar: [1],
				baz: true,
				yeah: {
					test1: 'Hi',
					test2: [10]
				},
				employee: {
					name: 'John',
					age: 30,
					employeeId: '0001222-B'
				}
			});
		});

	});

});
