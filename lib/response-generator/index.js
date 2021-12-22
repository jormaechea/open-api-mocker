'use strict';

const logger = require('lllog')();
const faker = require('faker');
const getFakerLocale = require('../utils/get-faker-locale');

faker.setLocale(getFakerLocale());

class ResponseGenerator {

	static generate(schemaResponse, preferredExampleName) {

		if(typeof schemaResponse.example !== 'undefined' || (schemaResponse.examples && Object.values(schemaResponse.examples).length)) {
			const bestExample = this.getBestExample(schemaResponse, preferredExampleName);
			if(bestExample !== undefined)
				return bestExample;
		}

		if(schemaResponse.enum && schemaResponse.enum.length)
			return this.generateByEnum(schemaResponse.enum);

		return this.generateBySchema(schemaResponse.schema || schemaResponse);
	}

	static getBestExample(schemaResponse, preferredExampleName) {

		if(typeof schemaResponse.example !== 'undefined')
			return schemaResponse.example;
		if(preferredExampleName && schemaResponse.examples[preferredExampleName] && schemaResponse.examples[preferredExampleName].value)
			return schemaResponse.examples[preferredExampleName].value;
		if(Object.values(schemaResponse.examples)[0].value)
			return Object.values(schemaResponse.examples)[0].value;
	}

	static generateByEnum(enumOptions) {
		const randomIndex = Math.floor(Math.random() * enumOptions.length);
		return enumOptions[randomIndex];
	}

	static generateBySchema(schemaResponse) {

		const fakerExtension = schemaResponse['x-faker'];
		if(fakerExtension) {
			try {
				return this.generateByFaker(fakerExtension);
			} catch(e) {
				logger.warn(
					`Failed to generate fake result using ${fakerExtension} schema. Falling back to primitive type.`
				);
			}
		}

		if(schemaResponse.example)
			return schemaResponse.example;

		if(schemaResponse.examples && schemaResponse.examples.length)
			return schemaResponse.examples[0];

		if(schemaResponse.allOf) {
			return schemaResponse.allOf.map(oneSchema => this.generate(oneSchema))
				.reduce((acum, oneSchemaValues) => ({ ...acum, ...oneSchemaValues }), {});
		}

		if(schemaResponse.oneOf || schemaResponse.anyOf)
			return this.generate((schemaResponse.oneOf || schemaResponse.anyOf)[0]);

		return this.generateByType(schemaResponse);
	}

	static generateByType(schemaResponse) {
		switch(schemaResponse.type) {
			case 'array':
				return this.generateArray(schemaResponse);

			case 'object':
				return this.generateObject(schemaResponse);

			case 'string':
				return this.generateString(schemaResponse);

			case 'number':
				return this.generateNumber(schemaResponse);

			case 'integer':
				return this.generateInteger(schemaResponse);

			case 'boolean':
				return this.generateBoolean(schemaResponse);

			default:
				throw new Error('Could not generate response: unknown type');
		}
	}

	static generateByFaker(fakerString) {

		// Check if faker string is a template string
		if(fakerString.match(/\{\{.+\}\}/))
			return faker.fake(fakerString);

		const fakerRegex = /^(?<namespace>\w+)\.(?<method>\w+)(?:\((?<argsString>.*)\))?$/.exec(
			fakerString
		);

		if(!fakerRegex)
			throw new Error('Faker extension method is not in the right format. Expecting <namespace>.<method> or <namespace>.<method>(<json-args>) format.');

		const { namespace, method, argsString } = fakerRegex.groups;

		if(!faker[namespace] || !faker[namespace][method])
			throw new Error(`Faker method '${namespace}.${method}' not found`);

		const args = argsString ? JSON.parse(`[${argsString}]`) : [];

		return faker[namespace][method](...args);
	}

	static generateArray(schema) {
		let count = Number(schema['x-count']);
		if(Number.isNaN(count) || count < 1)
			count = 1;

		return [...new Array(count)].map(() => this.generate(schema.items));
	}

	static generateObject(schema) {

		const properties = schema.properties || {};

		return Object.entries(properties)
			.map(([property, propertySchema]) => ([property, this.generate(propertySchema)]))
			.reduce((acum, [property, value]) => ({
				...acum,
				[property]: value
			}), {});
	}

	static generateString() {
		return 'string';
	}

	static generateNumber() {
		return 1;
	}

	static generateInteger() {
		return 1;
	}

	static generateBoolean() {
		return true;
	}

}

module.exports = ResponseGenerator;
