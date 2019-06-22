'use strict';

const assert = require('assert');

const ParserError = require('../../lib/errors/parser-error');
const { Parser, Server } = require('../../lib/servers');

describe('Servers', () => {

	describe('Schema parse', () => {

		const parser = new Parser();

		it('Should return an array with default server if servers is not defined', () => {

			const servers = parser.parse({});

			const defaultServer = new Server({ url: '/' });

			assert.deepStrictEqual(servers, [defaultServer]);
		});

		it('Should return an array with default server if servers is an empty array', () => {

			const servers = parser.parse({
				servers: []
			});

			const defaultServer = new Server({ url: '/' });

			assert.deepStrictEqual(servers, [defaultServer]);
		});

		it('Should throw a ParserError if servers is not an array', () => {

			const schema = {
				servers: 'I\'m not an array'
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should throw a ParserError if at least one server is not valid', () => {

			const schema = {
				servers: [
					{
						url: 'https://api.example.com'
					},
					{
						url: 0
					}
				]
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should return an array with the correct server if one server without variables is defined', () => {

			const servers = parser.parse({
				servers: [{
					url: 'https://api.example.com',
					description: 'A sample server'
				}]
			});

			const expectedServer = new Server({ url: 'https://api.example.com', description: 'A sample server' });

			assert.deepStrictEqual(servers, [expectedServer]);
		});

		it('Should return an array of both servers if two servers without variables are defined', () => {

			const servers = parser.parse({
				servers: [
					{
						url: 'https://api.example.com',
						description: 'A sample server'
					},
					{
						url: 'https://api2.example.com',
						description: 'Another sample server'
					}
				]
			});

			const expectedServer1 = new Server({ url: 'https://api.example.com', description: 'A sample server' });
			const expectedServer2 = new Server({ url: 'https://api2.example.com', description: 'Another sample server' });

			assert.deepStrictEqual(servers, [expectedServer1, expectedServer2]);
		});

		it('Should return an array with the correct server if one server with empty variables is defined', () => {

			const servers = parser.parse({
				servers: [{
					url: 'https://api.example.com',
					variables: {}
				}]
			});

			const expectedServer = new Server({ url: 'https://api.example.com' });

			assert.deepStrictEqual(servers, [expectedServer]);
		});

		it('Should throw a ParserError if server variables is not an object', () => {

			const schema = {
				servers: [
					{
						url: 'https://api.example.com',
						variables: []
					}
				]
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should throw a ParserError if server variables have invalid values', () => {

			const schema = {
				servers: [
					{
						url: 'https://api.example.com',
						variables: {
							foo: ['I\'m an array']
						}
					}
				]
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should throw a ParserError if server variables have no default', () => {

			const schema = {
				servers: [
					{
						url: 'https://api.example.com',
						variables: {
							foo: {
								enum: ['foo', 'bar']
							}
						}
					}
				]
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should return an array with the correct server if one server with variables is defined', () => {

			const servers = parser.parse({
				servers: [{
					url: 'https://api.example.com',
					description: 'A sample server',
					variables: {
						foo: {
							default: 'foo',
							enum: ['foo', 'bar']
						}
					}
				}]
			});

			const expectedServer = new Server({ url: 'https://api.example.com', description: 'A sample server' });

			assert.deepStrictEqual(servers, [expectedServer]);
		});

		it('Should replace the server variables in it\'s url', () => {

			const servers = parser.parse({
				servers: [{
					url: 'https://api.example.com/{stage}',
					description: 'A sample server',
					variables: {
						stage: {
							default: 'prod',
							enum: ['prod', 'test']
						}
					}
				}]
			});

			const expectedServer = new Server({ url: 'https://api.example.com/prod', description: 'A sample server' });

			assert.deepStrictEqual(servers, [expectedServer]);
		});

		it('Should mantain the specification extension properties', () => {

			const servers = parser.parse({
				servers: [{
					url: 'https://api.example.com/{stage}',
					description: 'A sample server',
					variables: {
						stage: {
							default: 'prod',
							enum: ['prod', 'test']
						}
					},
					'x-foo': 'bar',
					'x-baz': {
						test: [1, 2, 3]
					}
				}]
			});

			const expectedServer = new Server({ url: 'https://api.example.com/prod', description: 'A sample server' }, [
				['x-foo', 'bar'],
				['x-baz', { test: [1, 2, 3] }]
			]);

			assert.deepStrictEqual(servers, [expectedServer]);
		});

	});

});
