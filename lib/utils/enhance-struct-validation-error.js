'use strict';

const ParserError = require('../errors/parser-error');

const enhanceStructValidationError = (error, initialPath) => {

	const path = error.path
		.reduce((acum, pathPart) => `${acum}.${pathPart}`, initialPath);

	return new ParserError(error.message, path);

};

module.exports = enhanceStructValidationError;
