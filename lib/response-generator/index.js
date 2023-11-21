'use strict';

const logger = require('lllog')();
const getFakerLocale = require('../utils/get-faker-locale');

const faker = getFakerLocale();

const FORMAT_EXAMPLES = {
	date: '2023-11-17',
	time: '14:30:00Z',
	'date-time': '2023-11-17T14:30:00Z',
	'iso-time': '14:30:00Z',
	'iso-date-time': '2023-11-17T14:30:00Z',
	duration: 'PT2H30M',
	uri: 'https://www.example.com',
	'uri-reference': 'https://www.example.com/resource',
	'uri-template': 'https://www.example.com/{id}',
	url: 'https://www.example.com',
	email: 'example@email.com',
	hostname: 'www.example.com',
	ipv4: '192.168.0.1',
	ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
	regex: '^\\d{3}-\\d{2}-\\d{4}$',
	uuid: '550e8400-e29b-41d4-a716-446655440000',
	'json-pointer': '/path/to/resource',
	'relative-json-pointer': '2/foo',
	byte: 'SGVsbG8gd29ybGQ=',
	int32: 123,
	int64: 9223372036854776000,
	float: 3.14,
	double: 2.718281828459045,
	password: 'P@ssw0rd',
	binary: '01001000 01100101 01101100 01101100 01101111'
};

class ResponseGenerator {

	static generate(schemaResponse, preferredExampleName) {

		if((typeof schemaResponse.example !== 'undefined' && !schemaResponse['x-faker']) ||
			(schemaResponse.examples && Object.values(schemaResponse.examples).length)) {
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
		return faker.helpers.arrayElement(enumOptions);
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
			return faker.helpers.fake(fakerString);

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

	static generateString({ format }) {
		return FORMAT_EXAMPLES[format] || 'string';
	}

	static generateNumber({ format }) {
		return FORMAT_EXAMPLES[format] || 1;
	}

	static generateInteger({ format }) {
		return FORMAT_EXAMPLES[format] || 1;
	}

	static generateBoolean() {
		return true;
	}

}

module.exports = ResponseGenerator;
