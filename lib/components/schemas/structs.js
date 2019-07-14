'use strict';

const { struct } = require('superstruct');

const ExternalDocsStruct = require('../../external-documentation/structs');
const ReferenceStruct = require('../../structs/reference');

const SchemaStruct = struct.intersection([
	'object',
	struct.interface({
		title: 'string?',
		multipleOf: 'number?',
		maximum: 'number?',
		exclusiveMaximum: 'number?',
		minimum: 'number?',
		exclusiveMinimum: 'number?',
		maxLength: 'number?',
		minLength: 'number?',
		pattern: 'regexp?',
		maxItems: 'number?',
		minItems: 'number?',
		uniqueItems: 'boolean?',
		maxProperties: 'number?',
		minProperties: 'number?',
		required: 'boolean?',
		enum: struct.optional(struct.list([struct.any(['string', 'number', 'boolean'])])),
		type: 'string',
		allOf: struct.lazy(() => struct.optional(struct.list([struct.union([
			SchemaStruct,
			ReferenceStruct
		])]))),
		oneOf: struct.lazy(() => struct.optional(struct.list([struct.union([
			SchemaStruct,
			ReferenceStruct
		])]))),
		anyOf: struct.lazy(() => struct.optional(struct.list([struct.union([
			SchemaStruct,
			ReferenceStruct
		])]))),
		not: struct.lazy(() => struct.optional(struct.union([
			SchemaStruct,
			ReferenceStruct
		]))),
		items: struct.lazy(() => struct.optional(struct.union([
			SchemaStruct,
			ReferenceStruct
		]))),
		properties: struct.lazy(() => struct.optional(struct.union([
			SchemaStruct,
			ReferenceStruct
		]))),
		additionalProperties: struct.optional(struct.union([
			'boolean',
			struct.lazy(() => struct.union([
				SchemaStruct,
				ReferenceStruct
			]))
		])),
		description: 'string?',
		format: 'string?',
		default: struct.optional(struct.any(['string', 'number', 'boolean', 'object', 'array'])),
		nullable: 'boolean?',
		readOnly: 'boolean?',
		writeOnly: 'boolean?',
		externalDocs: ExternalDocsStruct,
		example: struct.optional(struct.any(['string', 'number', 'boolean', 'object', 'array'])),
		deprecated: 'boolean?'
	}, {
		nullable: false,
		readOnly: false,
		writeOnly: false,
		deprecated: false
	})
]);

module.exports = SchemaStruct;
