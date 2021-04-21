'use strict';

const ParserError = require('../errors/parser-error');
const Tag = require('./tag');
const TagsStruct = require('./structs');
const extractExtensions = require('../utils/extract-extensions');

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

			const path = e.path
				.reduce((acum, pathPart) => `${acum}.${pathPart}`, 'tags');

			throw new ParserError(e.message, path);
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
