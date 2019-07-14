'use strict';

const { struct } = require('superstruct');

const ReferenceStruct = struct({
	$ref: 'string'
});

module.exports = ReferenceStruct;
