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

		it('Should set the parameters of a passed in server instance', async () => {
			const server = {
				setServers: sandbox.stub().returnsThis(),
				setPort: sandbox.stub().returnsThis(),
				setPaths: sandbox.stub().returnsThis(),
				init: sandbox.stub().resolves()
			};

			const openApiMocker = new OpenApiMocker({ server });
			openApiMocker.setSchema(schema);

			await openApiMocker.validate();
			await openApiMocker.mock();

			sandbox.assert.calledOnce(server.setServers);
			sandbox.assert.calledOnce(server.setPort);
			sandbox.assert.calledOnce(server.setPaths);
			sandbox.assert.calledOnce(server.init);
		});

		it('should shutdown the server when shutdown is called', async () => {
			const openApiMocker = new OpenApiMocker({});

			await openApiMocker.shutdown();

			sandbox.assert.calledOnce(Server.prototype.shutdown);
		});

	});

});
