'use strict';

const app = require('express')();

class Server {

	constructor() {
		this.servers = [];
		this.paths = [];
	}

	setServers(servers) {
		this.servers = servers;
		return this;
	}

	setPort(port) {
		this.port = port;
		return this;
	}

	setPaths(paths) {
		this.paths = paths;
		return this;
	}

	init() {

		// eslint-disable-next-line no-console
		this.paths.map(path => console.log(`Must handle path ${path.method.toUpperCase()} ${path.uri}`));

		this.servers.map(({ url }) => {

			const { protocol, hostname, pathname } = url;

			const serverHref = `${protocol}//${hostname}${pathname}`;
			const serverPort = this.port;

			const server = app.listen(serverPort);

			server.on('listening', err => {

				if(err)
					throw err;

				const realPort = server.address().port;
				// eslint-disable-next-line no-console
				console.log(`Mocking API at ${serverHref} - Port ${realPort}`);
			});

			return server;
		});

	}

}

module.exports = Server;
