'use strict';

const fs = require('fs');

const sandbox = require('sinon').createSandbox();
const YAML = require('js-yaml');

const schema = YAML.safeLoad(fs.readFileSync('./tests/resources/pet-store.yml'));

const OpenApiMocker = require('../lib/open-api-mocker');
const Server = require('../lib/mocker/express/server.js');

describe('Openapi', () => {

	describe('Mocker', () => {

		beforeEach(() => {
			sandbox.spy(Server.prototype, 'setServers');
			sandbox.spy(Server.prototype, 'setPort');
			sandbox.spy(Server.prototype, 'setPaths');
			sandbox.stub(Server.prototype, 'init');
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

	});

});
