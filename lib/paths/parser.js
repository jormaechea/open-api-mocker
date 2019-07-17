'use strict';

const ParserError = require('../errors/parser-error');
const Path = require('./path');
const PathsStruct = require('./structs');

class Parser {

	parse(schema) {

		const { paths } = schema;

		this.validatePaths(paths);

		return Object.entries(paths)
			.map(([uri, operations]) => this.parsePath(uri, operations))
			.reduce((acum, operations) => (acum.length ? [...acum, ...operations] : operations), []);
	}

	validatePaths(paths) {

		try {
			return PathsStruct(paths);
		} catch(e) {

			const path = e.path
				.reduce((acum, pathPart) => `${acum}.${pathPart}`, 'paths');

			throw new ParserError(e.message, path);
		}
	}

	parsePath(uri, operations) {
		return Object.entries(operations)
			.map(([httpMethod, operationData]) => this.parseOperation(uri, httpMethod, operationData));
	}

	parseOperation(uri, httpMethod, { parameters, responses, ...otherProps }) {
		const extensionProps = Object.entries(otherProps)
			.filter(([propName]) => propName.substr(0, 2) === 'x-');

		return new Path({
			uri,
			httpMethod,
			parameters,
			responses
		}, extensionProps);
	}

}

module.exports = Parser;
