'use strict';

const assert = require('assert');
const fs = require('fs');
const EventEmitter = require('events');

const sinon = require('sinon');
const YAML = require('js-yaml');

const schema = YAML.load(fs.readFileSync('./tests/resources/pet-store.yml'));

const OpenApiMocker = require('../lib/open-api-mocker');
const Server = require('../lib/mocker/express/server.js');
const ExplicitSchemaLoader = require('../lib/schema-loaders/explicit-loader');
const LocalSchemaLoader = require('../lib/schema-loaders/local-loader');

class CustomServer {

	setServers() { return this; }

	setPort() { return this; }

	setPaths() { return this; }

	init() {}
}

class CustomSchemaLoader extends EventEmitter {
	load() { return schema; }
}

class CustomSchemaLoaderWithWatch extends EventEmitter {

	load() { return schema; }

	watch() {}
}

describe('OpenAPI Mocker', () => {

	beforeEach(() => {
		sinon.spy(Server.prototype, 'setServers');
		sinon.spy(Server.prototype, 'setPort');
		sinon.spy(Server.prototype, 'setPaths');
		sinon.stub(Server.prototype, 'init');
		sinon.stub(Server.prototype, 'shutdown');
	});

	afterEach(() => {
		sinon.restore();
	});

	describe('Servers', () => {

		context('Default server', () => {
			it('Should set the parameters to the built-in express server by default', async () => {

				const openApiMocker = new OpenApiMocker({});
				openApiMocker.setSchema(schema);

				await openApiMocker.validate();
				await openApiMocker.mock();

				sinon.assert.calledOnce(Server.prototype.setServers);
				sinon.assert.calledOnce(Server.prototype.setPort);
				sinon.assert.calledOnce(Server.prototype.setPaths);
				sinon.assert.calledOnce(Server.prototype.init);
			});
		});

		context('Custom server', () => {
			it('Should use the server instance passed as server option', async () => {

				sinon.spy(CustomServer.prototype, 'setServers');
				sinon.spy(CustomServer.prototype, 'setPort');
				sinon.spy(CustomServer.prototype, 'setPaths');
				sinon.stub(CustomServer.prototype, 'init');

				const openApiMocker = new OpenApiMocker({ server: new CustomServer() });
				openApiMocker.setSchema(schema);

				await openApiMocker.validate();
				await openApiMocker.mock();

				sinon.assert.calledOnce(CustomServer.prototype.setServers);
				sinon.assert.calledOnce(CustomServer.prototype.setPort);
				sinon.assert.calledOnce(CustomServer.prototype.setPaths);
				sinon.assert.calledOnce(CustomServer.prototype.init);

				// Should not use the default server
				sinon.assert.notCalled(Server.prototype.setServers);
				sinon.assert.notCalled(Server.prototype.setPort);
				sinon.assert.notCalled(Server.prototype.setPaths);
				sinon.assert.notCalled(Server.prototype.init);
			});
		});

	});

	describe('Schema loaders', () => {

		context('Common behaviour', () => {

			beforeEach(() => {
				sinon.stub(ExplicitSchemaLoader.prototype, 'load').returns(schema);
			});

			it('Should throw an error while validating if passed schema is invalid', async () => {

				const invalidSchema = ['invalid'];

				ExplicitSchemaLoader.prototype.load.returns(invalidSchema);

				const openApiMocker = new OpenApiMocker({
					schema: invalidSchema
				});

				await assert.rejects(openApiMocker.validate());
			});
		});

		context('Default loaders', () => {

			beforeEach(() => {
				sinon.stub(ExplicitSchemaLoader.prototype, 'load').returns(schema);
				sinon.stub(LocalSchemaLoader.prototype, 'load').resolves(schema);
				sinon.stub(LocalSchemaLoader.prototype, 'watch');
			});

			it('Should use the built-in explicit schema loader if a literal schema object is passed', async () => {

				sinon.spy(CustomSchemaLoader.prototype, 'load');

				const openApiMocker = new OpenApiMocker({
					schema
				});

				await openApiMocker.validate();
				await openApiMocker.mock();

				sinon.assert.calledOnce(ExplicitSchemaLoader.prototype.load);
				sinon.assert.notCalled(LocalSchemaLoader.prototype.load);
			});

			it('Should use the built-in explicit schema loader if a string schema (path) is passed', async () => {

				sinon.spy(CustomSchemaLoader.prototype, 'load');

				const openApiMocker = new OpenApiMocker({
					schema: 'path/to/schema'
				});

				await openApiMocker.validate();
				await openApiMocker.mock();

				sinon.assert.calledOnce(LocalSchemaLoader.prototype.load);
				sinon.assert.notCalled(ExplicitSchemaLoader.prototype.load);
			});
		});

		context('Custom loaders', () => {

			it('Should use a custom schema loader if it is provided', async () => {

				sinon.spy(CustomSchemaLoader.prototype, 'load');

				const openApiMocker = new OpenApiMocker({
					schemaLoader: CustomSchemaLoader,
					schema: 'someSchemaHint'
				});

				await openApiMocker.validate();
				await openApiMocker.mock();

				sinon.assert.calledOnce(CustomSchemaLoader.prototype.load);
			});

			it('Should call the watch method of the schema loader if watch option is passed', async () => {

				sinon.spy(CustomSchemaLoaderWithWatch.prototype, 'load');
				sinon.spy(CustomSchemaLoaderWithWatch.prototype, 'watch');

				const openApiMocker = new OpenApiMocker({
					schemaLoader: CustomSchemaLoaderWithWatch,
					schema: 'someSchemaHint',
					watch: true
				});

				await openApiMocker.validate();
				await openApiMocker.mock();

				sinon.assert.calledOnce(CustomSchemaLoaderWithWatch.prototype.load);
				sinon.assert.calledOnce(CustomSchemaLoaderWithWatch.prototype.watch);
			});

			it('Should not call the watch method of the schema loader if watch option is passed but loader does not support it', async () => {

				sinon.spy(CustomSchemaLoader.prototype, 'load');

				const openApiMocker = new OpenApiMocker({
					schemaLoader: CustomSchemaLoader,
					schema: 'someSchemaHint'
				});

				await openApiMocker.validate();
				await openApiMocker.mock();

				sinon.assert.calledOnce(CustomSchemaLoader.prototype.load);
			});

			it('Should not call the watch method of the schema loader if watch option is passed as false and loader supports it', async () => {

				sinon.spy(CustomSchemaLoaderWithWatch.prototype, 'load');
				sinon.spy(CustomSchemaLoaderWithWatch.prototype, 'watch');

				const openApiMocker = new OpenApiMocker({
					schemaLoader: CustomSchemaLoaderWithWatch,
					schema: 'someSchemaHint',
					watch: false
				});

				await openApiMocker.validate();
				await openApiMocker.mock();

				sinon.assert.calledOnce(CustomSchemaLoaderWithWatch.prototype.load);
				sinon.assert.notCalled(CustomSchemaLoaderWithWatch.prototype.watch);
			});

		});

		context('Watch feature', () => {

			let clock;

			beforeEach(() => {
				clock = sinon.useFakeTimers();
				sinon.stub(ExplicitSchemaLoader.prototype, 'load').returns(schema);
				sinon.stub(ExplicitSchemaLoader.prototype, 'removeAllListeners');
				sinon.stub(LocalSchemaLoader.prototype, 'load').returns(schema);
				sinon.stub(LocalSchemaLoader.prototype, 'removeAllListeners');
				sinon.stub(LocalSchemaLoader.prototype, 'watch');
				sinon.stub(LocalSchemaLoader.prototype, 'unwatch');
			});

			it('Should not remove listeners nor unwatch if watch option is not passed', async () => {

				const openApiMocker = new OpenApiMocker({
					schema
				});

				await openApiMocker.validate();
				await openApiMocker.mock();

				sinon.assert.notCalled(ExplicitSchemaLoader.prototype.removeAllListeners);

				openApiMocker.setSchema(schema);

				// Tick the clock and wait for the event loop to be empty
				await clock.tickAsync(1000);

				sinon.assert.notCalled(ExplicitSchemaLoader.prototype.removeAllListeners);

				sinon.assert.calledTwice(ExplicitSchemaLoader.prototype.load);
			});

			it('Should remove listeners but not unwatch if watch option is passed but schema loader does not support watch', async () => {

				const openApiMocker = new OpenApiMocker({
					schema,
					watch: true
				});

				await openApiMocker.validate();
				await openApiMocker.mock();

				sinon.assert.notCalled(ExplicitSchemaLoader.prototype.removeAllListeners);

				openApiMocker.setSchema(schema);

				// Tick the clock and wait for the event loop to be empty
				await clock.tickAsync(1000);

				sinon.assert.calledOnce(ExplicitSchemaLoader.prototype.removeAllListeners);

				sinon.assert.calledTwice(ExplicitSchemaLoader.prototype.load);
			});

			it('Should remove listeners and unwatch if watch option is not passed', async () => {

				const openApiMocker = new OpenApiMocker({
					schema: 'path/to/schema.json',
					watch: true
				});

				await openApiMocker.validate();
				await openApiMocker.mock();

				sinon.assert.notCalled(LocalSchemaLoader.prototype.removeAllListeners);
				sinon.assert.notCalled(LocalSchemaLoader.prototype.unwatch);

				openApiMocker.setSchema(schema);

				// Tick the clock and wait for the event loop to be empty
				await clock.tickAsync(1000);

				sinon.assert.calledOnce(LocalSchemaLoader.prototype.removeAllListeners);
				sinon.assert.calledOnce(LocalSchemaLoader.prototype.unwatch);
			});

			it('Should revalidate and mock the service again if schema loader emits the schema-changed event', async () => {

				const newSchema = {
					...schema,
					info: {
						...schema.info,
						title: 'New title'
					}
				};

				class CustomSchemaLoaderWithRealWatch extends CustomSchemaLoader {
					watch() {
						setTimeout(() => this.emit('schema-changed'), 1000);
					}
				}

				sinon.spy(OpenApiMocker.prototype, 'setSchema');
				sinon.spy(OpenApiMocker.prototype, 'validate');
				sinon.spy(OpenApiMocker.prototype, 'mock');
				const loadStub = sinon.stub(CustomSchemaLoaderWithRealWatch.prototype, 'load');
				loadStub.onCall(0).returns(schema);
				loadStub.onCall(1).returns(newSchema);

				const openApiMocker = new OpenApiMocker({
					schemaLoader: CustomSchemaLoaderWithRealWatch,
					schema,
					watch: true
				});

				await openApiMocker.validate();
				await openApiMocker.mock();

				sinon.assert.calledOnceWithExactly(OpenApiMocker.prototype.setSchema, schema);
				sinon.assert.calledOnce(CustomSchemaLoaderWithRealWatch.prototype.load);
				sinon.assert.calledOnce(OpenApiMocker.prototype.validate);
				sinon.assert.calledOnce(OpenApiMocker.prototype.mock);

				// Tick the clock and wait for the event loop to be empty
				await clock.tickAsync(1000);

				sinon.assert.calledTwice(OpenApiMocker.prototype.setSchema);
				sinon.assert.calledWithExactly(OpenApiMocker.prototype.setSchema.getCall(1), schema);
				sinon.assert.calledTwice(CustomSchemaLoaderWithRealWatch.prototype.load);
				sinon.assert.calledTwice(OpenApiMocker.prototype.validate);
				sinon.assert.calledTwice(OpenApiMocker.prototype.mock);
			});

		});

		context('Shoutdown', () => {

			it('Should call server shutdown and wait until it finishes', async () => {

				const openApiMocker = new OpenApiMocker({
					schema
				});

				await openApiMocker.validate();
				await openApiMocker.mock();
				await openApiMocker.shutdown();

				sinon.assert.calledOnce(Server.prototype.shutdown);
			});

		});

	});

});
