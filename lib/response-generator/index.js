'use strict';

class ResponseGenerator {

	static generate(schemaResponse) {

		if(schemaResponse.example)
			return schemaResponse.example;

		if(schemaResponse.examples && schemaResponse.examples.length)
			return schemaResponse.examples[0];

		if(schemaResponse.enum && schemaResponse.enum.length)
			return this.generateByEnum(schemaResponse.enum);

		if(schemaResponse.schema)
			return this.generateBySchema(schemaResponse.schema);

		if(schemaResponse.type)
			return this.generateBySchema(schemaResponse);
	}

	static generateByEnum(enumOptions) {
		return enumOptions[0];
	}

	static generateBySchema(schemaResponse) {

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

		if(schema.example)
			return schema.example;

		if(schema.allOf) {
			return schema.allOf.map(oneSchema => this.generateObject(oneSchema))
				.reduce((acum, oneSchemaValues) => ({ ...acum, ...oneSchemaValues }), {});
		}

		if(schema.oneOf)
			return this.generateObject(schema.oneOf[0]);

		if(schema.anyOf)
			return this.generateObject(schema.anyOf[0]);

		return this.generateObjectProperties(schema.properties);
	}

	static generateObjectProperties(properties) {
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
