'use strict';

const { struct } = require('superstruct');

const ExternalDocsStruct = require('../../external-documentation/structs');
const ReferenceStruct = require('../../structs/reference');

const optionalListOf = elementsStruct => struct.optional(struct.list([elementsStruct]));
const optionalUnionOf = validStructs => struct.optional(struct.union(validStructs));

const referenceUnion = otherStruct => struct.union([otherStruct, ReferenceStruct]);

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
		pattern: 'string|regexp?',
		maxItems: 'number?',
		minItems: 'number?',
		uniqueItems: 'boolean?',
		maxProperties: 'number?',
		minProperties: 'number?',
		required: struct.union(['boolean?', struct.optional(['string'])]),
		enum: optionalListOf(struct.union(['string', 'number', 'boolean'])),
		type: 'string?',
		allOf: struct.lazy(() => optionalListOf(referenceUnion(SchemaStruct))),
		oneOf: struct.lazy(() => optionalListOf(referenceUnion(SchemaStruct))),
		anyOf: struct.lazy(() => optionalListOf(referenceUnion(SchemaStruct))),
		not: struct.lazy(() => struct.optional(referenceUnion(SchemaStruct))),
		items: struct.lazy(() => struct.optional(referenceUnion(SchemaStruct))),
		properties: struct.lazy(() => struct.optional(struct.dict(['string', referenceUnion(SchemaStruct)]))),
		additionalProperties: optionalUnionOf([
			'boolean',
			struct.lazy(() => referenceUnion(SchemaStruct))
		]),
		description: 'string?',
		format: 'string?',
		default: optionalUnionOf(['string', 'number', 'boolean', 'object', 'array']),
		nullable: 'boolean?',
		readOnly: 'boolean?',
		writeOnly: 'boolean?',
		externalDocs: ExternalDocsStruct,
		example: optionalUnionOf(['string', 'number', 'boolean', 'object', 'array']),
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
