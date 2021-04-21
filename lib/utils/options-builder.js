'use strict';

const DefaultServer = require('../mocker/express/server');

const defaultOptions = {
	port: 5000,
	server: null,
	watch: false,
	schemaLoader: null
};

const forcedOptions = {
	alreadyWatching: false
};

module.exports = customOptions => {

	const finalOptions = {
		...defaultOptions,
		...customOptions,
		...forcedOptions
	};

	if(!finalOptions.server)
		finalOptions.server = new DefaultServer();

	return finalOptions;
};
