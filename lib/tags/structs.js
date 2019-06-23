'use strict';

const { struct } = require('superstruct');

const ExternalDocsStruct = require('../external-documentation/structs');

const TagStruct = struct.interface({
	name: 'string',
	description: 'string?',
	externalDocs: ExternalDocsStruct
});

const TagsStruct = struct.optional(struct.list([TagStruct]));

module.exports = TagsStruct;
