import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

void i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      common: {
        app: {
          title: 'CHN',
          shellReady: 'Platform shell ready',
          checkHealth: 'Check API health',
          healthOk: 'Backend is healthy',
          healthError: 'Backend is unreachable',
        },
      },
      errors: {},
    },
  },
  defaultNS: 'common',
  ns: ['common', 'errors'],
});

export default i18n;
