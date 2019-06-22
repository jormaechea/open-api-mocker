'use strict';

const { struct } = require('superstruct');

const ServerVariableStruct = struct.intersection([
	'object',
	struct.interface({
		default: 'string',
		enum: struct.optional(['string']),
		description: 'string?'
	})
]);

const ServerStruct = struct.interface({
	url: 'string',
	description: 'string?',
	variables: struct.optional(struct.dict(['string', ServerVariableStruct]))
});

const ServersStruct = struct.optional(struct.list([ServerStruct]));

module.exports = ServersStruct;
