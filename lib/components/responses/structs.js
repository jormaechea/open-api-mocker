'use strict';

const { struct } = require('superstruct');

const SchemaStruct = require('../schemas/structs');
const ReferenceStruct = require('../../structs/reference');


const HeaderStruct = struct.intersection([
	'object',
	struct.interface({
		description: 'string?',
		required: struct.optional('boolean'),
		deprecated: 'boolean?',
		style: struct.optional(struct.enum(['form', 'simple'])),
		explode: 'boolean?',
		schema: struct.optional(struct.union([
			SchemaStruct,
			ReferenceStruct
		])),
		example: struct.optional('string|number|object|array')
	}, {
		required: false,
		deprecated: false,
		style: 'simple',
		explode: false
	})
]);

const MediaTypeStruct = struct.interface({
	schema: struct.optional(struct.union([
		SchemaStruct,
		ReferenceStruct
	])),
	example: struct.optional(struct.union(['string', 'number', 'boolean', 'object', 'array'])),
	examples: struct.optional(struct.dict(['string', struct.intersection([
		'object',
		struct.interface({
			summary: 'string?',
			description: 'string?',
			value: struct.union(['string', 'number', 'boolean', 'object', 'array']),
			externalValue: 'string?'
		})
	])]))
});

const LinkStruct = struct.intersection([
	'object',
	struct.interface({})
]);

const ResponseStruct = struct.intersection([
	'object',
	struct.interface({
		description: 'string',
		headers: struct.optional(struct.dict([
			'string',
			struct.union([
				HeaderStruct,
				ReferenceStruct
			])
		])),
		content: struct.optional(struct.dict([
			'string',
			MediaTypeStruct
		])),
		links: struct.optional(struct.dict([
			'string',
			LinkStruct
		]))
	})
]);

module.exports = ResponseStruct;
