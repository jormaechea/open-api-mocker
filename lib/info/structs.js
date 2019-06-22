'use strict';

const { struct } = require('superstruct');

const ContactStruct = struct.intersection([
	'object',
	struct.interface({
		name: 'string?',
		url: 'string?',
		email: 'string?'
	})
]);

const LicenseStruct = struct.intersection([
	'object',
	struct.interface({
		name: 'string',
		url: 'string?'
	})
]);

const InfoStruct = struct.intersection([
	'object',
	struct.interface({
		title: 'string',
		description: 'string?',
		termsOfService: 'string?',
		contact: struct.optional(ContactStruct),
		license: struct.optional(LicenseStruct),
		version: 'string'
	})
]);

module.exports = InfoStruct;
