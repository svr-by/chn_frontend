import { normalizeUiLocale } from '@/lib/supportedLocales';

const EMPTY_DATE_PLACEHOLDER = '—';

function resolveDateLocale(language: string | null | undefined): string {
  switch (normalizeUiLocale(language)) {
    case 'ru':
      return 'ru';
    case 'zh':
      return 'zh-CN';
    default:
      return 'en';
  }
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatLocalizedDate(
  value: string | null | undefined,
  language: string | null | undefined,
): string {
  const date = parseDate(value);
  if (!date) {
    return EMPTY_DATE_PLACEHOLDER;
  }

  return date.toLocaleDateString(resolveDateLocale(language));
}

export function formatLocalizedDateTime(
  value: string | null | undefined,
  language: string | null | undefined,
): string {
  const date = parseDate(value);
  if (!date) {
    return EMPTY_DATE_PLACEHOLDER;
  }

  return date.toLocaleString(resolveDateLocale(language));
}
