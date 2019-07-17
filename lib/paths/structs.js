'use strict';

const { struct } = require('superstruct');

const ParameterStruct = require('../components/parameters/structs');
const ResponseStruct = require('../components/responses/structs');

const OperationStruct = struct.interface({
	parameters: struct.optional([ParameterStruct]),
	responses: struct.dict(['string', ResponseStruct])
});

const HttpMethodsStruct = struct.enum(['get', 'post', 'put', 'patch', 'delete', 'options', 'head']);

const PathStruct = struct.dict([HttpMethodsStruct, OperationStruct]);

const Paths = struct.dict(['string', PathStruct]);

module.exports = Paths;
