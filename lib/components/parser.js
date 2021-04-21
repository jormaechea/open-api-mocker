'use strict';

const ParserError = require('../errors/parser-error');
const Components = require('./components');
const ComponentsStruct = require('./structs');
const extractExtensions = require('../utils/extract-extensions');

class Parser {

	parse(schema) {

		const { components } = schema;

		this.validateComponents(components);

		return this.parseComponents(components || {});
	}

	validateComponents(components) {

		try {
			return ComponentsStruct(components);
		} catch(e) {
			throw new ParserError(e.message, 'components');
		}
	}

	parseComponents({
		schemas,
		responses,
		parameters,
		examples,
		requestBodies,
		headers,
		securitySchemes,
		links,
		callbacks,
		...otherProps
	}) {

		const extensionProps = extractExtensions(otherProps);

		return new Components({
			schemas,
			responses,
			parameters,
			examples,
			requestBodies,
			headers,
			securitySchemes,
			links,
			callbacks
		}, extensionProps);
	}

}

module.exports = Parser;
