'use strict';

const assert = require('assert');

const ParameterStruct = require('../../lib/components/parameters/structs');

describe('Components', () => {

	describe('Parameters', () => {

		describe('Query parameters', () => {

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
					allowEmptyValue: ['Invalid']
				}), {
					path: ['allowEmptyValue']
				});

				assert.throws(() => ParameterStruct({
					...parameter,
					allowReserved: ['Invalid']
				}), {
					path: ['allowReserved']
				});
			});

			it('Should pass if the parameter has the required properties and valid optional properties', () => {

				const parameter = {
					name: 'someName',
					in: 'query',
					required: false,
					allowEmptyValue: true,
					allowReserved: true
				};

				ParameterStruct(parameter);
			});

			it('Should set the default values', () => {

				const parameter = {
					name: 'someName',
					in: 'query'
				};

				const result = ParameterStruct(parameter);

				assert.strictEqual(result.required, false);
				// @todo Uncomment when superstruct issue #131 is resolved
				// assert.strictEqual(result.allowEmptyValue, false);
				// assert.strictEqual(result.allowReserved, false);
			});
		});
	});
});
