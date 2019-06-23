'use strict';

class Tag {

	constructor({ name, description, externalDocs }, extensionProps = []) {
		this.name = name;
		this.description = description;
		this.externalDocs = externalDocs;

		this.extensions = {};
		for(const [extensionName, extensionValue] of extensionProps)
			this.extensions[extensionName] = extensionValue;
	}

}

module.exports = Tag;
