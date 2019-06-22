'use strict';

const { struct } = require('superstruct');

const ParserError = require('./parser-error');
const Server = require('./server');

class Parser {

	parse(schema) {

		const { servers } = schema;

		this.validateServers(servers);

		if(!servers || !servers.length)
			return [this.defaultServer()];

		return servers
			.map(this.parseServer.bind(this));
	}

	defaultServer() {
		return Server.getDefault();
	}

	validateServers(servers) {

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

		try {
			return ServersStruct(servers);
		} catch(e) {

			const path = e.path
				.reduce((acum, pathPart) => `${acum}.${pathPart}`, 'servers');

			throw new ParserError(e.message, path);
		}
	}

	parseServer({ url, description, variables, ...otherProps }) {

		const extensionProps = Object.entries(otherProps)
			.filter(([propName]) => propName.substr(0, 2) === 'x-');

		return new Server({
			url,
			description,
			variables
		}, extensionProps);
	}

}

module.exports = Parser;
