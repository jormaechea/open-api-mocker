'use strict';

const faker = require('faker');

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

const getFakerLocale = (userLocaleParser = parseUserLocale) => {

	const userLocale = userLocaleParser();

	if(faker.locales[userLocale])
		return userLocale;

	if(userLocale.includes('_')) {
		const [baseUserLocale] = userLocale.split('_');
		if(faker.locales[baseUserLocale])
			return baseUserLocale;
	}

	return DEFAULT_LOCALE;
};

module.exports = getFakerLocale;
