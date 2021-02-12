'use strict';

const logger = require('lllog')();
const util = require('util');

const ResponseGenerator = require('../response-generator');
const SchemaValidator = require('../schema-validator');

class Path {

	constructor({
		uri,
		httpMethod,
		parameters,
		requestBody,
		responses
	}) {

		this.uri = uri;
		this.httpMethod = httpMethod;
		this.parameters = parameters || [];
		this.requestBody = requestBody;
		this.responses = responses;
	}

	validateRequestParameters({
		headers,
		query,
		path,
		cookies,
		requestBody
	}) {

		const request = { headers, query, path, cookies };

		return [
			...this.validateRequestBody(requestBody),
			...this.parameters
				.map(parameter => this.validateParameter(parameter, request))
				.filter(validation => !!validation)
		];
	}

	validateRequestBody(requestBody) {

		if(!this.requestBody)
			return [];

		if(!requestBody) {
			if(this.requestBody.required)
				return ['Missing required request body'];

			// If body wasn't required, then there's no problem
			return [];
		}

		const { content } = this.requestBody;

		if(!content) {
			// Cannot validate the body if it's content is not defined
			logger.warn('Missing content for request body');
			return [];
		}

		if(!content['application/json']) {
			// Cannot validate the body if it's application/json content is not defined
			logger.warn('Missing application/json content for request body');
			return [];
		}

		if(!content['application/json'].schema) {
			// Cannot validate the body if it's application/json content schema is not defined
			logger.warn('Missing application/json content schema for request body');
			return [];
		}

		// Validate the body
		const { schema } = content['application/json'];
		try {
			const validationErrors = SchemaValidator.validate(requestBody, schema);

			return validationErrors.map(error => {

				const cleanDataPath = error.dataPath.replace(/^\./, '');
				return `Invalid request body:${cleanDataPath && ` '${cleanDataPath}'`} ${error.message}`;
			});
		} catch(e) {
			logger.debug(e.stack);
			return [e.message];
		}
	}

	validateParameter(parameter, { headers, query, path, cookies }) {
		switch(parameter.in) {

			case 'header':
				return this._validateParameter({
					...parameter,
					name: parameter.name.toLowerCase()
				}, headers);

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

		try {
			const error = this.isValidType(schema.type, value);

			if(error)
				return `Invalid ${paramIn} param ${name}. Expected value of type ${schema.type} but received ${util.inspect(value)}`;

		} catch(e) {
			return `${e.message} for ${paramIn} param ${name}`;
		}
	}

	isValidType(type, value) {
		switch(type) {
			case 'array':
				return !Array.isArray(value);

			case 'object':
				return typeof value !== 'object' || Array.isArray(value);

			case 'string':
				return typeof value !== 'string';

			case 'number':
				return Number.isNaN(Number(value));

			case 'integer':
				return Number.isNaN(Number(value)) || (parseInt(Number(value), 10)) !== Number(value);

			case 'boolean':
				return value !== (!!value) && value !== 'true' && value !== 'false';

			default:
				throw new Error(`Invalid type declaration ${type}`);
		}
	}

	validateParameterEnum({ in: paramIn, name, schema }, value) {

		if(!this.isValidEnumValue(schema.enum, value)) {

			const enumAsString = schema.enum
				.map(util.inspect)
				.join(', ');

			return `Invalid ${paramIn} param ${name}. Expected enum of [${enumAsString}] but received ${util.inspect(value)}`;
		}
	}

	isValidEnumValue(possibleValues, value) {
		return !possibleValues || !possibleValues.length || possibleValues.includes(value);
	}

	getResponse(preferredStatusCode, preferredExampleName) {

		const {
			statusCode,
			headers,
			schema
		} = preferredStatusCode ? this.getResponseByStatusCode(preferredStatusCode) : this.getFirstResponse();

		return {
			statusCode: Number(statusCode),
			headers: headers && this.generateResponseHeaders(headers),
			body: schema ? ResponseGenerator.generate(schema, preferredExampleName) : null
		};
	}

	getResponseByStatusCode(statusCode) {

		if(!this.responses[statusCode]) {
			logger.warn(`Could not find a response for status code ${statusCode}. Responding with first response`);
			return this.getFirstResponse();
		}

		const preferredResponse = this.responses[statusCode];

		const [responseContent] = Object.values(preferredResponse.content || {});

		return { statusCode, schema: responseContent, headers: preferredResponse.headers };
	}

	getFirstResponse() {

		const [[statusCode, firstResponse]] = Object.entries(this.responses);
		const [firstResponseContent] = Object.values(firstResponse.content || {});

		return { statusCode, schema: firstResponseContent, headers: firstResponse.headers };
	}

	generateResponseHeaders(headersSchema) {

		const responseHeaders = {};

		for(const [headerName, headerData] of Object.entries(headersSchema))
			responseHeaders[headerName] = ResponseGenerator.generate(headerData);

		return responseHeaders;
	}

}

module.exports = Path;
