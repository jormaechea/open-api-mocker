'use strict';

class Info {

	constructor({ title, contact, license, version }, extensionProps = []) {
		this.title = title;
		this.contact = contact;
		this.license = license;
		this.version = version;

		this.extensions = {};
		for(const [extensionName, extensionValue] of extensionProps)
			this.extensions[extensionName] = extensionValue;
	}

}

module.exports = Info;
