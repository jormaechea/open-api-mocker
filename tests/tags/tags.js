'use strict';

const assert = require('assert');

const ParserError = require('../../lib/errors/parser-error');
const { Parser, Tag } = require('../../lib/tags');

describe('Tags', () => {

	describe('Schema parse', () => {

		const parser = new Parser();

		it('Should return an empty array if tags is not defined', () => {

			const tags = parser.parse({});

			assert.deepStrictEqual(tags, []);
		});

		it('Should return an empty array if tags is an empty array', () => {

			const tags = parser.parse({
				tags: []
			});

			assert.deepStrictEqual(tags, []);
		});

		it('Should throw a ParserError if tags is not an array', () => {

			const schema = {
				tags: 'I\'m not an array'
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should throw a ParserError if at least one tag is not valid', () => {

			const schema = {
				tags: [
					{
						name: 'Tag 1'
					},
					{
						name: 0
					}
				]
			};

			assert.throws(() => parser.parse(schema), ParserError);
		});

		it('Should return an array with the correct tag if one tag is defined only with a name', () => {

			const tags = parser.parse({
				tags: [{
					name: 'Tag 1'
				}]
			});

			const expectedTag = new Tag({ name: 'Tag 1' });

			assert.deepStrictEqual(tags, [expectedTag]);
		});

		it('Should return an array of both tags if two tags without variables are defined', () => {

			const schema = {
				tags: [
					{
						name: 'Tag 1'
					},
					{
						name: 'Tag 2',
						description: 'Description of tag 2'
					}
				]
			};

			const tags = parser.parse(schema);

			const expectedTag1 = new Tag(schema.tags[0]);
			const expectedTag2 = new Tag(schema.tags[1]);

			assert.deepStrictEqual(tags, [expectedTag1, expectedTag2]);
		});

		it('Should return an array with the correct tag if one tag is defined with all it\'s props', () => {

			const schema = {
				tags: [{
					name: 'Tag 2',
					description: 'Description of tag 2',
					externalDocs: {
						url: 'https://api.example.com/docs',
						description: 'The documentation description'
					}
				}]
			};

			const tags = parser.parse(schema);

			const expectedTag = new Tag(schema.tags[0]);

			assert.deepStrictEqual(tags, [expectedTag]);
		});

		it('Should mantain the specification extension properties', () => {

			const specificationTagInfo = {
				name: 'Tag 2',
				description: 'Description of tag 2',
				externalDocs: {
					url: 'https://api.example.com/docs',
					description: 'The documentation description'
				}
			};

			const schema = {
				tags: [{
					...specificationTagInfo,
					'x-foo': 'bar',
					'x-baz': {
						test: [1, 2, 3]
					}
				}]
			};

			const tags = parser.parse(schema);

			const expectedTag = new Tag(specificationTagInfo, [
				['x-foo', 'bar'],
				['x-baz', { test: [1, 2, 3] }]
			]);

			assert.deepStrictEqual(tags, [expectedTag]);
		});

	});

});
