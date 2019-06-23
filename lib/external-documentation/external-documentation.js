'use strict';

class ExternalDocumentation {

	constructor({ url, description }, extensionProps = []) {
		this.url = url;
		this.description = description;

		this.extensions = {};
		for(const [extensionName, extensionValue] of extensionProps)
			this.extensions[extensionName] = extensionValue;
	}

}

module.exports = ExternalDocumentation;
