'use strict';

const ParserError = require('../errors/parser-error');
const Components = require('./components');
const ComponentsStruct = require('./structs');

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

		const extensionProps = Object.entries(otherProps)
			.filter(([propName]) => propName.substr(0, 2) === 'x-');

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
