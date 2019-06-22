'use strict';

const ParserError = require('../errors/parser-error');
const Openapi = require('./openapi');
const OpenapiStruct = require('./structs');

class Parser {

	parse(schema) {

		const { openapi } = schema;

		this.validateOpenapi(openapi);

		return this.parseOpenapi(openapi);
	}

	validateOpenapi(openapi) {

		try {
			return OpenapiStruct(openapi);
		} catch(e) {
			throw new ParserError(e.message, 'openapi');
		}
	}

	parseOpenapi(openapi) {
		return new Openapi(openapi);
	}

}

module.exports = Parser;
