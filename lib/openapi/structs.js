'use strict';

const { superstruct } = require('superstruct');

const struct = superstruct({
	types: {
		openApi3Version: value => {
			if(typeof value !== 'string')
				return 'not_a_string';

			if(!value.match(/^3\.\d+\.\d+$/))
				return 'not_a_valid_version';

			return true;
		}
	}
});

const OpenapiStruct = struct('openApi3Version');

module.exports = OpenapiStruct;
