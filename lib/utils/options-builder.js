'use strict';

const DefaultServer = require('../mocker/express/server');

const defaultOptions = {
	port: 5000,
	server: null,
	watch: false
};

module.exports = customOptions => {

	const finalOptions = {
		...defaultOptions,
		...customOptions,
		alreadyWatching: false
	};

	if(!finalOptions.server)
		finalOptions.server = new DefaultServer();

	return finalOptions;
};
