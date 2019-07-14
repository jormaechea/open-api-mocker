'use strict';

class Components {

	constructor({
		schemas,
		responses,
		parameters,
		examples,
		requestBodies,
		headers,
		securitySchemes,
		links,
		callbacks
	}, extensionProps = []) {

		this.schemas = schemas;
		this.responses = responses;
		this.parameters = parameters;
		this.examples = examples;
		this.requestBodies = requestBodies;
		this.headers = headers;
		this.securitySchemes = securitySchemes;
		this.links = links;
		this.callbacks = callbacks;

		this.extensions = {};
		for(const [extensionName, extensionValue] of extensionProps)
			this.extensions[extensionName] = extensionValue;
	}

}

module.exports = Components;
