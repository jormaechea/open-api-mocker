'use strict';

const assert = require('assert');
const sinon = require('sinon');
const getFakerLocale = require('../../lib/utils/get-faker-locale');

describe('Utils', () => {

	describe('getFakerLocale()', () => {

		let localeFake;

		beforeEach(() => {
			localeFake = sinon.stub().returns({ locale: 'en' });
			sinon.stub(Intl, 'DateTimeFormat').returns({
				resolvedOptions: localeFake
			});
		});

		afterEach(() => sinon.restore());

		context('When locale has no country', () => {
			it('Should return the user locale if it is supported by faker', () => {
				const locale = getFakerLocale();
				assert.strictEqual(locale, 'en');
			});

			it('Should return the default locale (en) if user locale is not supported by faker', () => {

				localeFake.returns({ locale: 'zz' });

				const locale = getFakerLocale();
				assert.strictEqual(locale, 'en');
			});
		});

		context('When locale has country', () => {

			it('Should return the user locale if it is supported by faker', () => {

				localeFake.returns({ locale: 'en-US' });

				const locale = getFakerLocale();
				assert.strictEqual(locale, 'en_US');
			});

			it('Should return the user locale without country if locale is equals to country', () => {

				localeFake.returns({ locale: 'es-ES' });

				const locale = getFakerLocale();
				assert.strictEqual(locale, 'es');
			});

			it('Should return the user locale without country if it is not supported by faker but the base locale is', () => {

				localeFake.returns({ locale: 'en-ZZ' });

				const locale = getFakerLocale();
				assert.strictEqual(locale, 'en');
			});

			it('Should return the default locale if user locale nor the base locale are supported by faker', () => {

				localeFake.returns({ locale: 'aa-ZZ' });

				const locale = getFakerLocale();
				assert.strictEqual(locale, 'en');
			});
		});

		context('When faker locales do not follow the standard', () => {
			it('Should return pt_PT for the locale pt-PT', () => {

				localeFake.returns({ locale: 'pt-PT' });

				const locale = getFakerLocale();
				assert.strictEqual(locale, 'pt_PT');
			});
		});

	});

});
