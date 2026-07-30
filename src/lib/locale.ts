import type { PostAuthForgotPasswordBodyLocale } from '@/api/generated/models/postAuthForgotPasswordBodyLocale';
import { getStoredItem, setStoredItem } from '@/lib/browserStorage';
import {
  normalizeUiLocale,
  UI_LOCALE_STORAGE_KEY,
  type UiLocale,
} from '@/lib/supportedLocales';

function readStoredLocale(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return getStoredItem(UI_LOCALE_STORAGE_KEY) ?? document.documentElement.lang ?? null;
}

export function getUiLocale(): UiLocale {
  return normalizeUiLocale(readStoredLocale());
}

export function setUiLocale(locale: UiLocale): void {
  setStoredItem(UI_LOCALE_STORAGE_KEY, locale);
}

/** Email/API body locale — OpenAPI supports en|ru only; zh falls back to en. */
export function getApiLocale(): PostAuthForgotPasswordBodyLocale {
  const uiLocale = getUiLocale();
  return uiLocale === 'ru' ? 'ru' : 'en';
}
