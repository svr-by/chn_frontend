import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { getUiLocale } from '@/lib/locale';
import { UI_LOCALE_HTML_LANG } from '@/lib/supportedLocales';

const localeModules = import.meta.glob('../locales/*/*.json', {
  eager: true,
}) as Record<string, { default: Record<string, unknown> }>;

function loadLocaleResources(lang: string): Record<string, Record<string, unknown>> {
  const resources: Record<string, Record<string, unknown>> = {};

  for (const [filePath, module] of Object.entries(localeModules)) {
    const match = filePath.match(/\/locales\/([^/]+)\/([^/]+)\.json$/);
    if (!match || match[1] !== lang) {
      continue;
    }

    resources[match[2]] = module.default;
  }

  return resources;
}

export const I18N_NAMESPACES = [
  'common',
  'auth',
  'nav',
  'errors',
  'team',
  'profile',
  'partners',
  'products',
  'requests',
  'imports',
  'quotes',
  'selections',
  'invoices',
  'payments',
  'shipping',
  'consolidations',
  'collaboration',
  'notifications',
  'trace',
  'integrations',
  'enums',
  'validation',
] as const;

const initialLocale = getUiLocale();

if (typeof document !== 'undefined') {
  document.documentElement.lang = UI_LOCALE_HTML_LANG[initialLocale];
}

void i18n.use(initReactI18next).init({
  lng: initialLocale,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: loadLocaleResources('en'),
    ru: loadLocaleResources('ru'),
    zh: loadLocaleResources('zh'),
  },
  defaultNS: 'common',
  ns: [...I18N_NAMESPACES],
});

export default i18n;
