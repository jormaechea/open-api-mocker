'use strict';

const { allFakers } = require('@faker-js/faker');

const DEFAULT_LOCALE = 'en';

const parseUserLocale = () => {

	const { locale } = Intl.DateTimeFormat().resolvedOptions();

	const [lang, country = ''] = locale.split('-');

	if(!country)
		return lang;

	return lang.toLowerCase() === country.toLowerCase() &&
		lang.toLowerCase() !== 'pt'
		? lang
		: `${lang}_${country}`;
};

/**
 * @returns {import('@faker-js/faker').Faker}
 */
const getFakerLocale = (userLocaleParser = parseUserLocale) => {

	const userLocale = userLocaleParser();

	if(allFakers[userLocale])
		return allFakers[userLocale];

	if(userLocale.includes('_')) {
		const [baseUserLocale] = userLocale.split('_');
		if(allFakers[baseUserLocale])
			return allFakers[baseUserLocale];
	}

	return allFakers[DEFAULT_LOCALE];
};

module.exports = getFakerLocale;
