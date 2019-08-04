'use strict';

const logger = require('lllog')();
const util = require('util');

const ResponseGenerator = require('../response-generator');

class Path {

	constructor({
		uri,
		httpMethod,
		parameters,
		responses
	}) {

		this.uri = uri;
		this.httpMethod = httpMethod;
		this.parameters = parameters;
		this.responses = responses;
	}

	validateRequestParameters({ headers, query, path, cookies }) {

		if(!this.parameters || !this.parameters.length)
			return true;

		const request = { headers, query, path, cookies };

		return this.parameters
			.map(parameter => this.validateParameter(parameter, request))
			.filter(validation => !!validation);
	}

	validateParameter(parameter, { headers, query, path, cookies }) {
		switch(parameter.in) {

			case 'header':
				return this._validateParameter(parameter, headers);

			case 'query':
				return this._validateParameter(parameter, query);

			case 'path':
				return this._validateParameter(parameter, path);

			case 'cookie':
				return this._validateParameter(parameter, cookies);

			default:
				return `Invalid declaration for ${parameter.in} param ${parameter.name}`;
		}
	}

	_validateParameter(parameter, requestParameters) {

		const {
			in: paramIn,
			name,
			required,
			deprecated
		} = parameter;

		if(required && typeof requestParameters[name] === 'undefined')
			return `Missing required ${paramIn} param ${name}`;

		// Optional parameters not sent are always valid
		if(typeof requestParameters[name] === 'undefined')
			return;

		// If a deprecated parameter is received, leave a warning
		if(deprecated)
			logger.warn(`Using deprecated ${paramIn} param ${name}`);

		return this.validateParameterSchema(parameter, requestParameters[name]);
	}

	validateParameterSchema(parameter, value) {

		const { in: paramIn, name, schema } = parameter;

		if(!schema) {
			// Cannot validate a parameter if it's schema is not defined
			logger.warn(`Missing schema for ${paramIn} param ${name}`);
			return;
		}

		if(!schema.type) {
			logger.warn(`Missing schema type for ${paramIn} param ${name}`);
			return;
		}

		return this.validateParameterType(parameter, value)
			|| this.validateParameterEnum(parameter, value);
	}

	validateParameterType({ in: paramIn, name, schema }, value) {

		let error;

		// Validate first by it's type
		switch(schema.type) {
			case 'array':
				error = !Array.isArray(value);
				break;

			case 'object':
				error = typeof value !== 'object' || Array.isArray(value);
				break;

			case 'string':
				error = typeof value !== 'string';
				break;

			case 'number':
				error = typeof value !== 'number' || Number.isNaN(value);
				break;

			case 'integer':
				error = typeof value !== 'number' || Number.isNaN(value) || (value | 1) !== value;
				break;

			case 'boolean':
				error = value !== (!!value);
				break;

			default:
				return `Invalid type declaration for ${paramIn} param ${name}`;
		}

		if(error)
			return `Invalid ${paramIn} param ${name}. Expected value of type ${schema.type} but received ${util.inspect(value)}`;
	}

	validateParameterEnum({ in: paramIn, name, schema }, value) {

		if(schema.enum && schema.enum.length && !schema.enum.includes(value)) {

			const enumAsString = schema.enum
				.map(util.inspect)
				.join(', ');

			return `Invalid ${paramIn} param ${name}. Expected enum of [${enumAsString}] but received ${util.inspect(value)}`;
		}
	}

	getResponse(preferredStatusCode) {

		const {
			statusCode,
			schema
		} = preferredStatusCode ? this.getResponseByStatusCode(preferredStatusCode) : this.getFirstResponse();

		return {
			statusCode: Number(statusCode),
			body: ResponseGenerator.generate(schema)
		};
	}

	getResponseByStatusCode(statusCode) {

		if(!this.responses[statusCode]) {
			logger.warn(`Could not find a response for status code ${statusCode}. Responding with first response`);
			return this.getFirstResponse();
		}

		const [responseContent] = Object.values(this.responses[statusCode].content);

		return { statusCode, schema: responseContent };
	}

	getFirstResponse() {

		const [[statusCode, firstResponse]] = Object.entries(this.responses);
		const [firstResponseContent] = Object.values(firstResponse.content);

		return { statusCode, schema: firstResponseContent };
	}

}

module.exports = Path;
