'use strict';

const assert = require('assert');

const ParameterStruct = require('../../lib/components/parameters/structs');

describe('Components', () => {

	describe('Parameters', () => {

		describe('Common structure', () => {

			it('Should throw if the parameter is an not an object', () => {

				const parameter = [];

				assert.throws(() => ParameterStruct(parameter));
			});

			it('Should throw if the parameter doesn\'t have the required properties', () => {

				const parameter = {};

				assert.throws(() => ParameterStruct(parameter));
			});

			it('Should throw if the parameter has an invalid name property', () => {

				const parameter = {
					name: 1,
					in: 'query'
				};

				assert.throws(() => ParameterStruct(parameter), {
					path: ['name']
				});
			});

			it('Should throw if the parameter has an invalid in property', () => {

				const parameter = {
					name: 'someName',
					in: 'invalidIn'
				};

				assert.throws(() => ParameterStruct(parameter), {
					path: ['in']
				});
			});

			it('Should pass if the parameter has the required properties', () => {

				const parameter = {
					name: 'someName',
					in: 'query'
				};

				ParameterStruct(parameter);
			});

			it('Should throw if any optional property is invalid', () => {

				const parameter = {
					name: 'someName',
					in: 'query'
				};

				assert.throws(() => ParameterStruct({
					...parameter,
					description: ['Invalid']
				}), {
					path: ['description']
				});

				assert.throws(() => ParameterStruct({
					...parameter,
					required: ['Invalid']
				}), {
					path: ['required']
				});

				assert.throws(() => ParameterStruct({
					...parameter,
					deprecated: ['Invalid']
				}), {
					path: ['deprecated']
				});

				assert.throws(() => ParameterStruct({
					...parameter,
					style: ['Invalid']
				}), {
					path: ['style']
				});

				assert.throws(() => ParameterStruct({
					...parameter,
					explode: ['Invalid']
				}), {
					path: ['explode']
				});

				assert.throws(() => ParameterStruct({
					...parameter,
					schema: ['Invalid']
				}), {
					path: ['schema']
				});
			});

			it('Should pass if the parameter has the required properties and valid optional properties', () => {

				const parameter = {
					name: 'someName',
					in: 'query',
					description: 'Some description',
					required: true,
					deprecated: false,
					style: 'form',
					explode: true,
					example: { foo: 'bar' }
				};

				ParameterStruct(parameter);
			});

			it('Should set the default values', () => {

				const parameter = {
					name: 'someName',
					in: 'query'
				};

				const result = ParameterStruct(parameter);

				assert.deepStrictEqual(result, {
					...parameter,
					required: false,
					deprecated: false
					// @todo Uncomment when superstruct issue #131 is resolved
					// allowEmptyValue: false,
					// allowReserved: false
				});
			});

			it('Should allow and maintain the specification extension properties', () => {

				const parameter = {
					name: 'someName',
					in: 'query',
					'x-foo': 'bar',
					'x-baz': {
						test: [1, 2, 3]
					}
				};

				const result = ParameterStruct(parameter);

				assert.strictEqual(result['x-foo'], 'bar');
				assert.deepStrictEqual(result['x-baz'], { test: [1, 2, 3] });
			});
		});
	});
});
