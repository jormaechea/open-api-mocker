'use strict';

const SecurityRequirement = require('./security-requirement');
const SecurityRequirementsStruct = require('./structs');
const enhanceStructValidationError = require('../utils/enhance-struct-validation-error');

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
			throw enhanceStructValidationError(e, 'security');
		}
	}

	parseSecurityRequirement(requirements) {
		return new SecurityRequirement(requirements);
	}

}

module.exports = Parser;
