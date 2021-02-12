#!/usr/bin/env node

'use strict';

/* istanbul ignore file */

const CLI_ERRORS = {
	SCHEMA_NOT_FOUND: 1,
	SCHEMA_MALFORMED: 2,
	SCHEMA_INVALID: 3,
	RUNTIME_ERROR: 90
};

const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const YAML = require('js-yaml');

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

const mock = async () => {

	let schema;

	try {

		if(schemaPath.match(/\.ya?ml$/))
			schema = YAML.load(fs.readFileSync(schemaPath));
		else {
			delete require.cache[require.resolve(schemaPath)];
			schema = require(schemaPath); // eslint-disable-line global-require, import/no-dynamic-require
		}

	} catch(e) {
		logger.fatal(`Could not parse schema at ${schemaPath}: ${e.message}`);
		process.exit(CLI_ERRORS.SCHEMA_MALFORMED);
	}

	openApiMocker.setSchema(schema);

	return openApiMocker.validate()
		.then(() => {

			try {
				openApiMocker.mock();

				process.on('SIGINT', () => {
					logger.info('SIGINT received. Shutting down...');
					openApiMocker.shutdown();
					process.exit(0);
				});

			} catch(e) {
				logger.fatal(`Error while mocking schema: ${e.message}`);
				process.exit(CLI_ERRORS.RUNTIME_ERROR);
			}

		})
		.catch(e => {
			logger.fatal(`Error while validating schema: ${e.message}`);
			process.exit(CLI_ERRORS.SCHEMA_INVALID);
		});

};

mock().then(async () => {

	if(argv.watch) {

		chokidar.watch(schemaPath)
			.on('change', () => {
				setTimeout(async () => {
					await mock();
					logger.info('Watching changes...');
				}, 100);
			});
	}
});
