import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const languageDetector = new LanguageDetector();

const customDetector = {
  name: 'customDetector',
  lookup() {
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('fr') ? 'fr' : 'en';
  },
  cacheUserLanguage: false
};

languageDetector.addDetector(customDetector);

i18n
  .use(HttpBackend)
  .use(languageDetector) // 👈 Use the instance, not the default export
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    detection: {
      order: ['customDetector'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json'
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
