'use strict';

const Tag = require('./tag');
const TagsStruct = require('./structs');
const extractExtensions = require('../utils/extract-extensions');
const enhanceStructValidationError = require('../utils/enhance-struct-validation-error');

class Parser {

	parse(schema) {

		const { tags } = schema;

		this.validateTags(tags);

		if(!tags || !tags.length)
			return [];

		return tags
			.map(this.parseTag.bind(this));
	}

	validateTags(tags) {

		try {
			return TagsStruct(tags);
		} catch(e) {
			throw enhanceStructValidationError(e, 'tags');
		}
	}

	parseTag({ name, description, externalDocs, ...otherProps }) {

		const extensionProps = extractExtensions(otherProps);

		return new Tag({
			name,
			description,
			externalDocs
		}, extensionProps);
	}

}

module.exports = Parser;
