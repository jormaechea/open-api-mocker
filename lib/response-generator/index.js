'use strict';

class ResponseGenerator {

	static generate(schemaResponse, preferredExampleName) {

		if(schemaResponse.example)
			return schemaResponse.example;

		if(schemaResponse.examples && Object.values(schemaResponse.examples).length) {
			if(preferredExampleName && schemaResponse.examples[preferredExampleName] && schemaResponse.examples[preferredExampleName].value)
				return schemaResponse.examples[preferredExampleName].value;
			if(Object.values(schemaResponse.examples)[0].value)
				return Object.values(schemaResponse.examples)[0].value;
		}

		if(schemaResponse.enum && schemaResponse.enum.length)
			return this.generateByEnum(schemaResponse.enum);

		if(schemaResponse.schema)
			return this.generateBySchema(schemaResponse.schema);

		if(schemaResponse.type)
			return this.generateBySchema(schemaResponse);

		throw new Error(`Could not generate response: invalid schema: ${JSON.stringify(schemaResponse)}`);
	}

	static generateByEnum(enumOptions) {
		return enumOptions[0];
	}

	static generateBySchema(schemaResponse) {

		if(schemaResponse.example)
			return schemaResponse.example;

		if(schemaResponse.examples && schemaResponse.examples.length)
			return schemaResponse.examples[0];

		if(schemaResponse.allOf) {
			return schemaResponse.allOf.map(oneSchema => this.generate(oneSchema))
				.reduce((acum, oneSchemaValues) => ({ ...acum, ...oneSchemaValues }), {});
		}

		if(schemaResponse.oneOf)
			return this.generate(schemaResponse.oneOf[0]);

		if(schemaResponse.anyOf)
			return this.generate(schemaResponse.anyOf[0]);

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

	static generateArray(schema) {
		return [this.generate(schema.items)];
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
