'use strict';

const { struct } = require('superstruct');

const SchemaStruct = require('../schemas/structs');
const ReferenceStruct = require('../../structs/reference');

// const defaultStyles = {
// 	query: 'form',
// 	path: 'simple',
// 	header: 'simple',
// 	cookie: 'form'
// };

const ParameterStruct = struct.intersection([
	'object',
	struct.interface({
		name: 'string',
		in: struct.enum(['query', 'header', 'path', 'cookie']),
		description: 'string?',
		required: struct.dynamic((value, parameter) => (parameter.in === 'path' ? struct.literal(true) : struct('boolean?'))),
		deprecated: 'boolean?',
		allowEmptyValue: struct.dynamic((value, parameter) => (parameter.in === 'query' ? struct('boolean?') : struct('undefined'))),
		style: struct.optional(struct.enum(['form', 'simple', 'matrix', 'label', 'spaceDelimited', 'pipeDelimited', 'deepObject'])),
		explode: 'boolean?',
		allowReserved: struct.dynamic((value, parameter) => (parameter.in === 'query' ? struct('boolean?') : struct('undefined'))),
		schema: struct.optional(struct.union([
			SchemaStruct,
			ReferenceStruct
		])),
		example: struct.optional('string|number|object|array')
	}, {
		required: false,
		deprecated: false
		// @todo Uncomment when superstruct issue #131 is resolved
		// allowEmptyValue: parameter => (parameter.in === 'query' ? false : undefined),
		// style: parameter => defaultStyles[parameter.in],
		// explode: parameter => parameter.style === 'form',
		// allowReserved: parameter => (parameter.in === 'query' ? false : undefined)
	})
]);

module.exports = ParameterStruct;
