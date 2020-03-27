'use strict';

const sandbox = require('sinon').createSandbox();
const expressApp = require('express')();
const mockRequire = require('mock-require');

const expressAppMock = sandbox.stub(expressApp);
mockRequire('express', () => expressAppMock);

const Server = require('../../../lib/mocker/express/server');

describe('Mocker', () => {

	describe('Express server', () => {

		after(() => {
			mockRequire.stopAll();
			sandbox.restore();
		});

		afterEach(() => {
			sandbox.reset();
			sandbox.resetBehavior();
			sandbox.resetHistory();
		});

		it('Should listen at a random port by default', () => {

			const fakeServerOn = sandbox.fake();

			expressAppMock.listen.returns({
				on: fakeServerOn
			});

			const server = new Server();
			server.init();

			sandbox.assert.calledOnce(expressAppMock.listen);
			sandbox.assert.calledWithExactly(expressAppMock.listen.getCall(0), undefined);
		});

		it('Should listen at the correct port if it\'s set', () => {

			const fakeServerOn = sandbox.fake();

			expressAppMock.listen.returns({
				on: fakeServerOn
			});

			const server = new Server();
			server.setPort(8000);
			server.init();

			sandbox.assert.calledTwice(expressAppMock.listen);
			sandbox.assert.calledWithExactly(expressAppMock.listen.getCall(1), 8000);
		});

		it('Should set the catch all request for not found resources', () => {

			const fakeServerOn = sandbox.fake();

			expressAppMock.listen.returns({
				on: fakeServerOn
			});

			const server = new Server();
			server.init();

			sandbox.assert.calledThrice(expressAppMock.all);
			sandbox.assert.calledWithExactly(expressAppMock.all.getCall(2), '*', sandbox.match.func);
		});

		it('Should set the request handlers for the passed paths', () => {

			const simplePath = {
				httpMethod: 'get',
				uri: '/hello-world',
				getResponse: () => ({ message: 'Hi there!' })
			};

			const pathWithOneVariable = {
				httpMethod: 'post',
				uri: '/hello-world/{world}',
				getResponse: () => ({ message: 'Hi there again!' })
			};

			const pathWithVariables = {
				httpMethod: 'post',
				uri: '/hello-world/{world}/planet/{myPlanet}',
				getResponse: () => ({ message: 'Hi there again!' })
			};

			const pathWithUnderscoredVariable = {
				httpMethod: 'post',
				uri: '/hello-world/{my_world}',
				getResponse: () => ({ message: 'Hi there again!' })
			};

			const fakeServerOn = sandbox.fake();

			expressAppMock.listen.returns({
				on: fakeServerOn
			});

			const server = new Server();
			server.setPaths([simplePath, pathWithOneVariable, pathWithVariables, pathWithUnderscoredVariable]);
			server.init();

			sandbox.assert.calledOnce(expressAppMock.get);
			sandbox.assert.calledWithExactly(expressAppMock.get.getCall(0), ['/hello-world'], sandbox.match.func);
			sandbox.assert.calledThrice(expressAppMock.post);
			sandbox.assert.calledWithExactly(expressAppMock.post.getCall(0), ['/hello-world/:world'], sandbox.match.func);
			sandbox.assert.calledWithExactly(expressAppMock.post.getCall(1), ['/hello-world/:world/planet/:myPlanet'], sandbox.match.func);
			sandbox.assert.calledWithExactly(expressAppMock.post.getCall(2), ['/hello-world/:my_world'], sandbox.match.func);
		});
	});
});
