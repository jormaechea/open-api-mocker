#!/usr/bin/env node

'use strict';

/* istanbul ignore file */

const CLI_ERRORS = {
	SCHEMA_NOT_FOUND: 1,
	SCHEMA_MALFORMED: 2,
	SCHEMA_INVALID: 3,
	RUNTIME_ERROR: 90
};

const fs = require('fs');
const path = require('path');
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

const logger = require('lllog')();
const OpenApiMocker = require('./open-api-mocker');

const schemaPath = argv.schema.match(/^\//) ? argv.schema : path.join(process.cwd(), argv.schema);

try {
	fs.accessSync(schemaPath, fs.constants.R_OK);
} catch(e) {
	logger.fatal(`Could not open schema at ${schemaPath}`);
	process.exit(CLI_ERRORS.SCHEMA_NOT_FOUND);
}

let schema;

try {

	if(schemaPath.match(/\.ya?ml$/))
		schema = YAML.load(schemaPath);
	else
		schema = require(schemaPath); // eslint-disable-line global-require, import/no-dynamic-require

} catch(e) {
	logger.fatal(`Could not parse schema at ${schemaPath}`);
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
			logger.fatal(`Error while mocking schema: ${e.message}`);
			process.exit(CLI_ERRORS.RUNTIME_ERROR);
		}

	})
	.catch(e => {
		logger.fatal(`Error while validating schema: ${e.message}`);
		process.exit(CLI_ERRORS.SCHEMA_INVALID);
	});
