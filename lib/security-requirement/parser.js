'use strict';

const ParserError = require('../errors/parser-error');
const SecurityRequirement = require('./security-requirement');
const SecurityRequirementsStruct = require('./structs');

class Parser {

	parse(schema) {

		const { security } = schema;

		this.validateSecurityRequirements(security);

		if(!security || !security.length)
			return [];

		return security
			.map(this.parseSecurityRequirement.bind(this));
	}

	validateSecurityRequirements(security) {

		try {
			return SecurityRequirementsStruct(security);
		} catch(e) {

			const path = e.path
				.reduce((acum, pathPart) => `${acum}.${pathPart}`, 'security');

			throw new ParserError(e.message, path);
		}
	}

	parseSecurityRequirement(requirements) {
		return new SecurityRequirement(requirements);
	}

}

module.exports = Parser;
