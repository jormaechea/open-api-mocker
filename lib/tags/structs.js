'use strict';

const { struct } = require('superstruct');

const ExternalDocsStruct = struct.intersection([
	'object',
	struct.interface({
		url: 'string',
		description: 'string?'
	})
]);

const TagStruct = struct.interface({
	name: 'string',
	description: 'string?',
	externalDocs: struct.optional(ExternalDocsStruct)
});

const TagsStruct = struct.optional(struct.list([TagStruct]));

module.exports = TagsStruct;
