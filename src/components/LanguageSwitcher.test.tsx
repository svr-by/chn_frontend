import { describe, expect, it, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import i18n from '@/app/i18n';
import { renderWithProviders } from '@/test/render';
import { UI_LOCALE_STORAGE_KEY } from '@/lib/supportedLocales';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
    void i18n.changeLanguage('en');
    document.documentElement.lang = 'en';
  });

  it('persists selected locale and changes i18n language', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageSwitcher />);

    await user.click(screen.getByRole('button', { name: 'Language' }));
    await user.click(screen.getByRole('menuitem', { name: 'Русский' }));

    expect(localStorage.getItem(UI_LOCALE_STORAGE_KEY)).toBe('ru');
    expect(i18n.language).toBe('ru');
    expect(document.documentElement.lang).toBe('ru');
  });

  it('supports switching to Chinese', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageSwitcher />);

    await user.click(screen.getByRole('button', { name: 'Language' }));
    await user.click(screen.getByRole('menuitem', { name: '中文' }));

    expect(localStorage.getItem(UI_LOCALE_STORAGE_KEY)).toBe('zh');
    expect(i18n.language).toBe('zh');
    expect(document.documentElement.lang).toBe('zh-Hans');
  });
});
