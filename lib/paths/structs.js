'use strict';

const { struct } = require('superstruct');

const ParameterStruct = require('../components/parameters/structs');
const ResponseStruct = require('../components/responses/structs');
const ReferenceStruct = require('../structs/reference');
const SchemaStruct = require('../components/schemas/structs');

const MediaTypeStruct = struct.interface({
	schema: struct.optional(struct.union([
		SchemaStruct,
		ReferenceStruct
	])),
	example: struct.optional(struct.union(['string', 'number', 'boolean', 'object', 'array']))
});

const OperationStruct = struct.interface({
	parameters: struct.optional([ParameterStruct]),
	responses: struct.dict(['string', ResponseStruct]),
	requestBody: struct.optional(struct.union([
		ReferenceStruct,
		struct.object({
			description: 'string?',
			content: struct.dict(['string', MediaTypeStruct]),
			required: 'boolean?'
		}, {
			required: false
		})
	]))
});

const HttpMethodsStruct = struct.enum(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace']);

const PathStruct = struct.dict([HttpMethodsStruct, OperationStruct]);

const Paths = struct.dict(['string', PathStruct]);

module.exports = Paths;
