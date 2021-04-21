'use strict';

const ParserError = require('../errors/parser-error');
const Info = require('./info');
const InfoStruct = require('./structs');
const extractExtensions = require('../utils/extract-extensions');

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

		const extensionProps = extractExtensions(otherProps);

		return new Info({
			title,
			contact,
			license,
			version
		}, extensionProps);
	}

}

module.exports = Parser;
