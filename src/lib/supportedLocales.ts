export const SUPPORTED_UI_LOCALES = ['en', 'ru', 'zh'] as const;

export type UiLocale = (typeof SUPPORTED_UI_LOCALES)[number];

export const UI_LOCALE_STORAGE_KEY = 'chn_locale';

export const UI_LOCALE_LABELS: Record<UiLocale, string> = {
  en: 'English',
  ru: 'Русский',
  zh: '中文',
};

export const UI_LOCALE_HTML_LANG: Record<UiLocale, string> = {
  en: 'en',
  ru: 'ru',
  zh: 'zh-Hans',
};

export function isUiLocale(value: string | null | undefined): value is UiLocale {
  return (
    value === 'en' ||
    value === 'ru' ||
    value === 'zh'
  );
}

export function normalizeUiLocale(value: string | null | undefined): UiLocale {
  if (isUiLocale(value)) {
    return value;
  }

  if (value?.startsWith('ru')) {
    return 'ru';
  }

  if (value?.startsWith('zh')) {
    return 'zh';
  }

  return 'en';
}
