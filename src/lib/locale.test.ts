import { describe, expect, it, beforeEach } from 'vitest';

import { getApiLocale, getUiLocale, setUiLocale } from '@/lib/locale';
import { UI_LOCALE_STORAGE_KEY } from '@/lib/supportedLocales';

describe('locale helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
  });

  it('defaults UI locale to en', () => {
    expect(getUiLocale()).toBe('en');
    expect(getApiLocale()).toBe('en');
  });

  it('returns ru for UI and API when ru is stored', () => {
    setUiLocale('ru');
    expect(getUiLocale()).toBe('ru');
    expect(getApiLocale()).toBe('ru');
  });

  it('falls back zh UI locale to en for transactional email API', () => {
    setUiLocale('zh');
    expect(getUiLocale()).toBe('zh');
    expect(getApiLocale()).toBe('en');
  });

  it('normalizes stored locale prefixes', () => {
    localStorage.setItem(UI_LOCALE_STORAGE_KEY, 'zh-CN');
    expect(getUiLocale()).toBe('zh');
  });
});
