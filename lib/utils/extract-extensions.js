'use strict';

const extractExtensions = object => Object.entries(object)
	.filter(([propName]) => propName.substr(0, 2) === 'x-');

module.exports = extractExtensions;
