'use strict';

const { struct } = require('superstruct');

const SecurityRequirementStruct = struct.dict(['string', ['string']]);

const SecurityRequirementsStruct = struct.list([SecurityRequirementStruct]);

module.exports = struct.optional(SecurityRequirementsStruct);
