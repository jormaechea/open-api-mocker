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
		exclusiveMaximum: 'boolean?',
		minimum: 'number?',
		exclusiveMinimum: 'boolean?',
		maxLength: 'number?',
		minLength: 'number?',
		pattern: 'regexp?',
		maxItems: 'number?',
		minItems: 'number?',
		uniqueItems: 'boolean?',
		maxProperties: 'number?',
		minProperties: 'number?',
		required: struct.union(['boolean?', struct.optional(['string'])]),
		enum: struct.optional(struct.list([struct.union(['string', 'number', 'boolean'])])),
		type: 'string?',
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
		properties: struct.lazy(() => struct.optional(struct.dict(['string', struct.union([
			SchemaStruct,
			ReferenceStruct
		])]))),
		additionalProperties: struct.optional(struct.union([
			'boolean',
			struct.lazy(() => struct.union([
				SchemaStruct,
				ReferenceStruct
			]))
		])),
		description: 'string?',
		format: 'string?',
		default: struct.optional(struct.union(['string', 'number', 'boolean', 'object', 'array'])),
		nullable: 'boolean?',
		readOnly: 'boolean?',
		writeOnly: 'boolean?',
		externalDocs: ExternalDocsStruct,
		example: struct.optional(struct.union(['string', 'number', 'boolean', 'object', 'array'])),
		deprecated: 'boolean?'
	}, {
		type: 'object',
		nullable: false,
		readOnly: false,
		writeOnly: false,
		deprecated: false
	})
]);

module.exports = SchemaStruct;
