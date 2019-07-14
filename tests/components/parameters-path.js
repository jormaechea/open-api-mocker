'use strict';

const assert = require('assert');

const ParameterStruct = require('../../lib/components/parameters/structs');

describe('Components', () => {

	describe('Parameters', () => {

		describe('Path parameters', () => {

			it('Should pass if the parameter doesn\'t have the `required` property set as true', () => {

				const parameter = {
					name: 'someName',
					in: 'path'
				};

				assert.throws(() => ParameterStruct(parameter), {
					path: ['required']
				});

				assert.throws(() => ParameterStruct({
					...parameter,
					required: false
				}), {
					path: ['required']
				});
			});

			it('Should pass if the parameter has the required properties', () => {

				const parameter = {
					name: 'someName',
					in: 'path',
					required: true
				};

				ParameterStruct(parameter);
			});

			it('Should throw if any optional property is invalid', () => {

				const parameter = {
					name: 'someName',
					in: 'path',
					required: true
				};

				assert.throws(() => ParameterStruct({
					...parameter,
					allowEmptyValue: true
				}), {
					path: ['allowEmptyValue']
				});

				assert.throws(() => ParameterStruct({
					...parameter,
					allowReserved: true
				}), {
					path: ['allowReserved']
				});
			});
		});
	});
});
