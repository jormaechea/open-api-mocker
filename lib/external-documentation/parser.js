'use strict';

const ParserError = require('../errors/parser-error');
const ExternalDocumentation = require('./external-documentation');
const ExternalDocumentationsStruct = require('./structs');

class Parser {

	parse(schema) {

		const { externalDocs } = schema;

		this.validateExternalDocumentations(externalDocs);

		return this.parseExternalDocumentation(externalDocs || {});
	}

	validateExternalDocumentations(externalDocs) {

		try {
			return ExternalDocumentationsStruct(externalDocs);
		} catch(e) {

			const path = e.path
				.reduce((acum, pathPart) => `${acum}.${pathPart}`, 'externalDocs');

			throw new ParserError(e.message, path);
		}
	}

	parseExternalDocumentation({ url, description, ...otherProps }) {

		const extensionProps = Object.entries(otherProps)
			.filter(([propName]) => propName.substr(0, 2) === 'x-');

		return new ExternalDocumentation({
			url,
			description
		}, extensionProps);
	}

}

module.exports = Parser;
