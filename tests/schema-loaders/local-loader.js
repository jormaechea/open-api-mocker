'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

const sinon = require('sinon');
const chokidar = require('chokidar');

const LocalSchemaLoader = require('../../lib/schema-loaders/local-loader');

const changeYamlToJson = string => string.replace(/\.yaml$/, '.json');

describe('Schema Loaders', () => {
	describe('Local Schema Loader', () => {

		describe('load()', () => {

			beforeEach(() => {
				sinon.stub(fs, 'accessSync');
				sinon.stub(fs, 'readFileSync');
			});

			afterEach(() => sinon.restore());

			const fakePath = 'path/to/schema.yaml';
			const fakeFullPath = path.join(process.cwd(), 'path/to/schema.yaml');

			it('Should throw if the schema does not exist', () => {
				fs.accessSync.throws(new Error('File not found'));

				const schemaLoader = new LocalSchemaLoader(fakePath);
				assert.throws(() => schemaLoader.load(), {
					name: 'OpenAPISchemaNotFound'
				});

				sinon.assert.calledOnceWithExactly(fs.accessSync, fakeFullPath, fs.constants.R_OK);
				sinon.assert.notCalled(fs.readFileSync);
			});

			it('Should throw if the schema fails to be read', () => {
				fs.readFileSync.throws(new Error('File could not be read'));

				const schemaLoader = new LocalSchemaLoader(fakePath);
				assert.throws(() => schemaLoader.load(), {
					name: 'OpenAPISchemaMalformed'
				});

				sinon.assert.calledOnceWithExactly(fs.accessSync, fakeFullPath, fs.constants.R_OK);
				sinon.assert.calledOnceWithExactly(fs.readFileSync, fakeFullPath);
			});

			it('Should throw if the schema is not a valid YAML', () => {
				fs.readFileSync.returns('>>');

				const schemaLoader = new LocalSchemaLoader(fakePath);
				assert.throws(() => schemaLoader.load(), {
					name: 'OpenAPISchemaMalformed'
				});

				sinon.assert.calledOnceWithExactly(fs.accessSync, fakeFullPath, fs.constants.R_OK);
				sinon.assert.calledOnceWithExactly(fs.readFileSync, fakeFullPath);
			});

			it('Should return the schema if it is a valid YAML', () => {
				fs.readFileSync.returns('foo: bar');

				const schemaLoader = new LocalSchemaLoader(fakePath);
				assert.deepStrictEqual(schemaLoader.load(), {
					foo: 'bar'
				});

				sinon.assert.calledOnceWithExactly(fs.accessSync, fakeFullPath, fs.constants.R_OK);
				sinon.assert.calledOnceWithExactly(fs.readFileSync, fakeFullPath);
			});

			it('Should throw if the schema is not a valid JSON', () => {
				fs.readFileSync.returns('>>');

				const schemaLoader = new LocalSchemaLoader(changeYamlToJson(fakePath));
				assert.throws(() => schemaLoader.load(), {
					name: 'OpenAPISchemaMalformed'
				});

				sinon.assert.calledOnceWithExactly(fs.accessSync, changeYamlToJson(fakeFullPath), fs.constants.R_OK);
				sinon.assert.calledOnceWithExactly(fs.readFileSync, changeYamlToJson(fakeFullPath));
			});

			it('Should return the schema if it is a valid JSON', () => {
				fs.readFileSync.returns('{"foo": "bar"}');

				const schemaLoader = new LocalSchemaLoader(changeYamlToJson(fakePath));
				assert.deepStrictEqual(schemaLoader.load(), {
					foo: 'bar'
				});

				sinon.assert.calledOnceWithExactly(fs.accessSync, changeYamlToJson(fakeFullPath), fs.constants.R_OK);
				sinon.assert.calledOnceWithExactly(fs.readFileSync, changeYamlToJson(fakeFullPath));
			});

			it('Should handle an absolute schema properly', () => {
				fs.readFileSync.returns('foo: bar');

				const schemaLoader = new LocalSchemaLoader(fakeFullPath);
				assert.deepStrictEqual(schemaLoader.load(), {
					foo: 'bar'
				});

				sinon.assert.calledOnceWithExactly(fs.accessSync, fakeFullPath, fs.constants.R_OK);
				sinon.assert.calledOnceWithExactly(fs.readFileSync, fakeFullPath);
			});

		});

		describe('watch()', () => {

			let clock;

			beforeEach(() => {
				sinon.stub(LocalSchemaLoader.prototype, 'load');
				sinon.stub(chokidar, 'watch');
				clock = sinon.useFakeTimers();
			});

			afterEach(() => sinon.restore());

			const fakePath = 'path/to/schema.yaml';

			it('Should emit the schema-changed event each time the schema changes', () => {

				LocalSchemaLoader.prototype.load.onCall(0).returns({ foo: 'bar' });
				LocalSchemaLoader.prototype.load.onCall(1).returns({ foo: 'bar2' });
				LocalSchemaLoader.prototype.load.onCall(2).returns({ foo: 'bar3' });

				const chokidarEmitter = new EventEmitter();
				chokidar.watch.returns(chokidarEmitter);

				const changeCallback = sinon.fake();

				const schemaLoader = new LocalSchemaLoader(fakePath);
				schemaLoader.on('schema-changed', changeCallback);

				schemaLoader.watch();

				// Should not emit initially
				sinon.assert.notCalled(changeCallback);

				chokidarEmitter.emit('change');

				// Should not emit immediately after change
				sinon.assert.notCalled(changeCallback);

				clock.tick(100);

				// Should emit after 100ms
				sinon.assert.calledOnce(changeCallback);

				// And now test consecutive calls
				chokidarEmitter.emit('change');
				clock.tick(100);
				sinon.assert.calledTwice(changeCallback);

				chokidarEmitter.emit('change');
				clock.tick(100);
				sinon.assert.calledThrice(changeCallback);
			});

		});

	});
});
