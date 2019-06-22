'use strict';

class ParserError extends Error {

	constructor(message, errorPath) {
		super(`${message} in ${errorPath}`);
	}
}

module.exports = ParserError;
