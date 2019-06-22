'use strict';

module.exports = {
	extends: 'airbnb-base',

	env: {
		node: true,
		es6: true,
		mocha: true
	},

	parserOptions: {
		sourceType: 'script'
	},

	rules: {
		'operator-linebreak': 0,
		'no-continue': 0,
		'no-plusplus': 0,
		'prefer-spread': 0,
		'prefer-rest-params': 0,
		'class-methods-use-this': 0,
		'consistent-return': 0,
		'prefer-template': 0,
		'import/no-unresolved': 0,
		'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/tests/**/*.js'] }],

		'no-bitwise': 0,

		curly: ['error', 'multi-or-nest'],

		'no-underscore-dangle': ['warn', {
			allowAfterThis: true,
			allowAfterSuper: true,
			allow: ['_call', '__rootpath', '_where']
		}],

		'no-tabs': 0,

		'no-new': 0,

		'func-names': 0,

		'space-before-function-paren': ['error', {
			'anonymous': 'never',
			'named': 'never',
			'asyncArrow': 'always'
		}],

		'arrow-parens': ['error', 'as-needed'],
		'arrow-body-style': 0,

		indent: ['error', 'tab', {
			SwitchCase: 1
		}],

		'comma-dangle': ['error', 'never'],

		'padded-blocks': 0,

		'max-len': ['error', {
			code: 150,
			tabWidth: 1,
			comments: 200
		}],

		'spaced-comment': ['error', 'always', {
			exceptions: ['*']
		}],

		'newline-per-chained-call': ['error', {
			ignoreChainWithDepth: 2
		}],

		'no-param-reassign': 0,

		'no-prototype-builtins': 0,

		'keyword-spacing': ['error', {
			overrides: {
				if: {
					after: false
				},
				for: {
					after: false
				},
				while: {
					after: false
				},
				switch: {
					after: false
				},
				catch: {
					after: false
				}
			}
		}],

		'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
		'function-paren-newline': 0,
		'no-await-in-loop': 0,

		'object-curly-newline': ['error', {
			ObjectExpression: { minProperties: 5, multiline: true, consistent: true },
			ObjectPattern: { minProperties: 5, multiline: true, consistent: true }
		}],
		'nonblock-statement-body-position': ['error', 'below', { overrides: { else: 'any' } }]
	}
};