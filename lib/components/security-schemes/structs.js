'use strict';

const { struct } = require('superstruct');

const baseSchema = {
	type: 'string',
	description: 'string?'
};

const ApiKeyStruct = struct.interface({
	type: struct.literal('apiKey'),
	name: 'string',
	in: struct.enum(['query', 'header', 'cookie'])
});

const HttpStruct = struct.interface({
	type: struct.literal('http'),
	scheme: 'string',
	bearerFormat: struct.dynamic((value, parent) => (parent.scheme && parent.scheme.toLowerCase() === 'bearer' ? struct('string') : struct('undefined')))
});

const Oauth2BaseStruct = {
	refreshUrl: 'string?',
	scopes: struct.dict(['string', 'string'])
};
const Oauth2ImplicitFlowStruct = struct.interface({
	...Oauth2BaseStruct,
	authorizationUrl: 'string'
});
const Oauth2PasswordFlowStruct = struct.interface({
	...Oauth2BaseStruct,
	tokenUrl: 'string'
});
const Oauth2ClientCredentialsFlowStruct = struct.interface({
	...Oauth2BaseStruct,
	tokenUrl: 'string'
});
const Oauth2AuthorizationCodeFlowStruct = struct.interface({
	...Oauth2BaseStruct,
	authorizationUrl: 'string',
	tokenUrl: 'string'
});

const Oauth2FlowsStruct = {
	// This should all be struct.optional(Oauth2{...}FlowStruct) but it breaks in superstruct 0.6.1
	implicit: struct.union(['undefined', Oauth2ImplicitFlowStruct]),
	password: struct.union(['undefined', Oauth2PasswordFlowStruct]),
	clientCredentials: struct.union(['undefined', Oauth2ClientCredentialsFlowStruct]),
	authorizationCode: struct.union(['undefined', Oauth2AuthorizationCodeFlowStruct])
};

const Oauth2Struct = struct.interface({
	type: struct.literal('oauth2'),
	flows: struct.intersection([
		'object',
		struct.interface(Oauth2FlowsStruct)
	])
});

const OpenIdConnectStruct = struct.interface({
	type: struct.literal('openIdConnect'),
	openIdConnectUrl: 'string'
});

const SecuritySchemeStruct = struct.intersection([
	'object',
	struct.interface(baseSchema),
	struct.union([
		ApiKeyStruct,
		HttpStruct,
		Oauth2Struct,
		OpenIdConnectStruct
	])
]);

module.exports = SecuritySchemeStruct;
