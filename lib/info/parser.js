'use strict';

const ParserError = require('../errors/parser-error');
const Info = require('./info');
const InfoStruct = require('./structs');

class Parser {

	parse(schema) {

		const { info } = schema;

		this.validateInfo(info);

		return this.parseInfo(info);
	}

	validateInfo(info) {

		try {
			return InfoStruct(info);
		} catch(e) {
			throw new ParserError(e.message, 'info');
		}
	}

	parseInfo({
		title,
		contact,
		license,
		version,
		...otherProps
	}) {

		const extensionProps = Object.entries(otherProps)
			.filter(([propName]) => propName.substr(0, 2) === 'x-');

		return new Info({
			title,
			contact,
			license,
			version
		}, extensionProps);
	}

}

module.exports = Parser;
