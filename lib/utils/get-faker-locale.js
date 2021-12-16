'use strict';

const getFakerLocale = () => {
	const { locale } = Intl.DateTimeFormat().resolvedOptions();
	const [lang, country = ''] = locale.split('-');

	return (lang.toLowerCase() === country.toLowerCase()) ? lang : `${lang}_${country}`;
};

module.exports = getFakerLocale;
