'use strict';

const fs = require('fs');

const sandbox = require('sinon').createSandbox();
const YAML = require('js-yaml');

const schema = YAML.load(fs.readFileSync('./tests/resources/pet-store.yml'));

const OpenApiMocker = require('../lib/open-api-mocker');
const Server = require('../lib/mocker/express/server.js');

describe('Openapi', () => {

	describe('Mocker', () => {

		beforeEach(() => {
			sandbox.spy(Server.prototype, 'setServers');
			sandbox.spy(Server.prototype, 'setPort');
			sandbox.spy(Server.prototype, 'setPaths');
			sandbox.stub(Server.prototype, 'init');
			sandbox.stub(Server.prototype, 'shutdown');
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('Should set the parameters to the server', async () => {

			const openApiMocker = new OpenApiMocker({});
			openApiMocker.setSchema(schema);

			await openApiMocker.validate();
			await openApiMocker.mock();

			sandbox.assert.calledOnce(Server.prototype.setServers);
			sandbox.assert.calledOnce(Server.prototype.setPort);
			sandbox.assert.calledOnce(Server.prototype.setPaths);
			sandbox.assert.calledOnce(Server.prototype.init);
		});

		it('Should set the parameters to a custom server if it is passed as option', async () => {

			class CustomServer {

				setServers() { return this; }

				setPort() { return this; }

				setPaths() { return this; }

				init() {}
			}

			sandbox.spy(CustomServer.prototype, 'setServers');
			sandbox.spy(CustomServer.prototype, 'setPort');
			sandbox.spy(CustomServer.prototype, 'setPaths');
			sandbox.stub(CustomServer.prototype, 'init');

			const openApiMocker = new OpenApiMocker({ server: new CustomServer() });
			openApiMocker.setSchema(schema);

			await openApiMocker.validate();
			await openApiMocker.mock();

			sandbox.assert.calledOnce(CustomServer.prototype.setServers);
			sandbox.assert.calledOnce(CustomServer.prototype.setPort);
			sandbox.assert.calledOnce(CustomServer.prototype.setPaths);
			sandbox.assert.calledOnce(CustomServer.prototype.init);
		});

	});

});
