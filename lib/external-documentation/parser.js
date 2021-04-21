'use strict';

const ExternalDocumentation = require('./external-documentation');
const ExternalDocumentationsStruct = require('./structs');
const extractExtensions = require('../utils/extract-extensions');
const enhanceStructValidationError = require('../utils/enhance-struct-validation-error');

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
			throw enhanceStructValidationError(e, 'externalDocs');
		}
	}

	parseExternalDocumentation({ url, description, ...otherProps }) {

		const extensionProps = extractExtensions(otherProps);

		return new ExternalDocumentation({
			url,
			description
		}, extensionProps);
	}

}

module.exports = Parser;
