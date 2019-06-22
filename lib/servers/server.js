'use strict';

class Server {

	static getDefault() {
		return new Server({
			url: '/'
		});
	}

	constructor({ url, description, variables = {} }, extensionProps = []) {
		this.url = url;
		this.description = description;

		for(const [variableName, variableData] of Object.entries(variables))
			this.url = this.url.replace(new RegExp(`{${variableName}}`, 'g'), variableData.default);

		this.extensions = {};
		for(const [extensionName, extensionValue] of extensionProps)
			this.extensions[extensionName] = extensionValue;
	}

}

module.exports = Server;
