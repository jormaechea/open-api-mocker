'use strict';

// const assert = require('assert');
const sandbox = require('sinon').createSandbox();
const YAML = require('yamljs');

const schema = YAML.load('./tests/resources/pet-store.yml');

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

		it('Should throw a ParserError if openapi is not defined', async () => {

			const openApiMocker = new OpenApiMocker({ schema });

			openApiMocker.validate();
			await openApiMocker.mock();

			sandbox.assert.calledOnce(Server.prototype.setServers);
			sandbox.assert.calledOnce(Server.prototype.setPort);
			sandbox.assert.notCalled(Server.prototype.setPaths);
			sandbox.assert.calledOnce(Server.prototype.init);
		});

	});

});
