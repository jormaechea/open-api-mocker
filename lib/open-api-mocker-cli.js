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
	.option('watch', {
		type: 'boolean',
		alias: 'w',
		description: 'Indicates if schema should be watched for changes or not',
		default: false
	})
	.option('verbose', {
		type: 'boolean',
		alias: 'v',
		default: false
	})
	.demandOption('schema')
	.help();

const logger = require('lllog')();

if(argv.verbose)
	logger.setMinLevel('debug');

const OpenApiMocker = require('./open-api-mocker');

const schemaPath = argv.schema.match(/^\//) ? argv.schema : path.join(process.cwd(), argv.schema);

try {
	fs.accessSync(schemaPath, fs.constants.R_OK);
} catch(e) {
	logger.fatal(`Could not open schema at ${schemaPath}`);
	process.exit(CLI_ERRORS.SCHEMA_NOT_FOUND);
}

const openApiMocker = new OpenApiMocker({
	port: argv.port
});

openApiMocker.loadSchema({
	schemaPath,
	watch: argv.watch
})
	.then(() => openApiMocker.validate())
	.then(() => openApiMocker.mock());
