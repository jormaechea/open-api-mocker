'use strict';

const ResponseGenerator = require('../response-generator');

class Path {

	constructor({
		uri,
		httpMethod,
		parameters,
		responses
	}, extensionProps = []) {

		this.uri = uri;
		this.httpMethod = httpMethod;
		this.parameters = parameters;
		this.responses = responses;

		this.extensions = {};
		for(const [extensionName, extensionValue] of extensionProps)
			this.extensions[extensionName] = extensionValue;
	}

	getResponse() {
		const [firstResponse] = Object.values(this.responses);
		const [firstResponseContent] = Object.values(firstResponse.content);

		return ResponseGenerator.generate(firstResponseContent);
	}

}

module.exports = Path;
