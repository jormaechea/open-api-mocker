#!/usr/bin/env node

'use strict';

const CLI_ERRORS = {
	SCHEMA_NOT_FOUND: 1,
	SCHEMA_MALFORMED: 2,
	SCHEMA_INVALID: 3,
	RUNTIME_ERROR: 90
};

const fs = require('fs');
const YAML = require('yamljs');

const { argv } = require('yargs')
	.option('port', {
		alias: 'p',
		description: 'The port to bind on',
		type: 'number',
		default: 5000
	})
	.option('schema', {
		alias: 's',
		description: 'The path of the schema to mock',
		type: 'string'
	})
	.option('verbose', {
		alias: 'v',
		default: false
	})
	.demandOption('schema')
	.help();

const OpenApiMocker = require('./open-api-mocker');

try {
	fs.accessSync(argv.schema, fs.constants.R_OK);
} catch(e) {
	console.error(`Could not open schema at ${argv.schema}`); // eslint-disable-line no-console
	process.exit(CLI_ERRORS.SCHEMA_NOT_FOUND);
}

let schema;

try {

	if(argv.schema.match(/\.ya?ml$/))
		schema = YAML.load(argv.schema);
	else
		schema = require(argv.schema); // eslint-disable-line global-require, import/no-dynamic-require

} catch(e) {
	console.error(`Could not parse schema at ${argv.schema}`); // eslint-disable-line no-console
	process.exit(CLI_ERRORS.SCHEMA_MALFORMED);
}

const openApiMocker = new OpenApiMocker({
	schema,
	port: argv.port
});

openApiMocker.validate()
	.then(() => {

		try {
			openApiMocker.mock();
		} catch(e) {
			console.error(`Error while mocking schema: ${e.message}`); // eslint-disable-line no-console
			process.exit(CLI_ERRORS.RUNTIME_ERROR);
		}

	})
	.catch(e => {
		console.error(`Error while validating schema: ${e.message}`); // eslint-disable-line no-console
		process.exit(CLI_ERRORS.SCHEMA_INVALID);
	});
