'use strict';

const Server = require('./server');
const ServersStruct = require('./structs');
const extractExtensions = require('../utils/extract-extensions');
const enhanceStructValidationError = require('../utils/enhance-struct-validation-error');

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
			throw enhanceStructValidationError(e, 'servers');
		}
	}

	parseServer({ url, description, variables, ...otherProps }) {

		const extensionProps = extractExtensions(otherProps);

		return new Server({
			url,
			description,
			variables
		}, extensionProps);
	}

}

module.exports = Parser;
