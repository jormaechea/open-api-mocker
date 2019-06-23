'use strict';

const { struct } = require('superstruct');

const ExternalDocsStruct = struct.intersection([
	'object',
	struct.interface({
		url: 'string',
		description: 'string?'
	})
]);

module.exports = struct.optional(ExternalDocsStruct);
