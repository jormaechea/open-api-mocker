'use strict';

const Ajv = require('ajv');
const logger = require('lllog')();
const fs = require('fs');
const path = require('path');
const { argv } = require('yargs')
	.option('formats', {
		alias: 'f',
		description: 'The path of the additional formats file',
		type: 'string'
	});

const ajv = new Ajv({ unknownFormats: ['password'] });

if(argv.formats) {
	const additionalFormatsPath = argv.formats;
	const formatsPath = additionalFormatsPath.match(/^\//) ? additionalFormatsPath : path.join(process.cwd(), additionalFormatsPath);
	const additionalFormats = JSON.parse(fs.readFileSync(formatsPath));
	if(additionalFormats) {
		additionalFormats.map(format => ajv.addFormat(format.name, {
			type: format.type,
			validate: (data => {
				const regex = RegExp(format.regex);
				const result = regex.test(data);
				logger.debug(`${format.name} check for ${data} results with ${result}`);
				return result;
			})
		})
		);
	}
}

class SchemaValidator {

	static validate(data, schema) {
		return !ajv.validate(schema, data) ? ajv.errors : [];
	}

}

module.exports = SchemaValidator;
