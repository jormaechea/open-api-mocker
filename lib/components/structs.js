'use strict';

const { struct } = require('superstruct');

const ReferenceStruct = require('../structs/reference');

const componentTypes = [
	'schemas',
	'responses',
	'parameters',
	'examples',
	'requestBodies',
	'headers',
	'securitySchemes',
	'links',
	'callbacks'
];

const componentTypesStruct = {};

for(const componentType of componentTypes) {

	let ComponentTypeStruct;
	try {
		// eslint-disable-next-line global-require, import/no-dynamic-require
		ComponentTypeStruct = require(`./${componentType.replace(/([A-Z])/g, l => `-${l.toLowerCase()}`)}/structs`);
	} catch(e) {
		continue;
	}

	componentTypesStruct[componentType] = struct.optional(struct.dict([
		'string',
		struct.union([
			ComponentTypeStruct,
			ReferenceStruct
		])
	]));
}

const ComponentsStruct = struct.intersection([
	'object',
	struct.interface(componentTypesStruct)
]);

module.exports = struct.optional(ComponentsStruct);
