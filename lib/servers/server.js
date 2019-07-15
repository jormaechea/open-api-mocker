'use strict';

const { URL } = require('url');

class Server {

	static getDefault() {
		return new Server({
			url: '/'
		});
	}

	static get defaultUrlBase() {
		return 'http://0.0.0.0';
	}

	constructor({ url, description, variables = {} }, extensionProps = []) {

		let finalUrl = url;

		for(const [variableName, variableData] of Object.entries(variables))
			finalUrl = finalUrl.replace(new RegExp(`{${variableName}}`, 'g'), variableData.default);

		const urlBase = finalUrl.match(/^https?:\/\//) ? undefined : this.constructor.defaultUrlBase;

		this.url = new URL(finalUrl, urlBase);
		this.description = description;

		this.extensions = {};
		for(const [extensionName, extensionValue] of extensionProps)
			this.extensions[extensionName] = extensionValue;
	}

}

module.exports = Server;
