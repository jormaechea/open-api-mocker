#!/usr/bin/env node

'use strict';

/* istanbul ignore file */

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
		default: false,
		conflicts: 'quiet'
	})
	.option('quiet', {
		type: 'boolean',
		alias: 'q',
		description: 'Suppress request output, only show errors',
		default: false,
		conflicts: 'verbose'
	})
	.demandOption('schema')
	.help();

const logger = require('lllog')();

const { RUNTIME_ERROR } = require('./errors/cli-error-codes');

if(argv.verbose)
	logger.setMinLevel('debug');
else if(argv.quiet)
	logger.setMinLevel('error');


const OpenApiMocker = require('./open-api-mocker');

(async () => {

	try {
		const openApiMocker = new OpenApiMocker({
			port: argv.port,
			schema: argv.schema,
			watch: !!argv.watch
		});

		await openApiMocker.validate();

		process.on('SIGINT', async () => {
			logger.info('SIGINT received. Shutting down...');
			await openApiMocker.shutdown();
			process.exit(0);
		});

		await openApiMocker.mock();

	} catch(e) {
		logger.fatal(`Error while mocking schema: ${e.message}`);
		process.exit(e.cliError || RUNTIME_ERROR);
	}

})();
