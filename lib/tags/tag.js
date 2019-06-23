'use strict';

const { Parser: ExternalDocumentationParser } = require('../external-documentation');

class Tag {

	constructor({ name, description, externalDocs }, extensionProps = []) {

		const externalDocumentationParser = new ExternalDocumentationParser();

		this.name = name;
		this.description = description;
		this.externalDocs = externalDocumentationParser.parse({ externalDocs });

		this.extensions = {};
		for(const [extensionName, extensionValue] of extensionProps)
			this.extensions[extensionName] = extensionValue;
	}

}

module.exports = Tag;
