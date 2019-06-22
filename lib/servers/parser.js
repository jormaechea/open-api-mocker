'use strict';

const ParserError = require('../errors/parser-error');
const Server = require('./server');
const ServersStruct = require('./structs');

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
