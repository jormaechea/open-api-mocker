'use strict';

const ResponseGenerator = require('../response-generator');

class Path {

	constructor({
		uri,
		httpMethod,
		parameters,
		responses
	}) {

		this.uri = uri;
		this.httpMethod = httpMethod;
		this.parameters = parameters;
		this.responses = responses;
	}

	getResponse() {
		const [firstResponse] = Object.values(this.responses);
		const [firstResponseContent] = Object.values(firstResponse.content);

		return ResponseGenerator.generate(firstResponseContent);
	}

}

module.exports = Path;
