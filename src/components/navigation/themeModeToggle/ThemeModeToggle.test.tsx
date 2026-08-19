import { describe, expect, it, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeModeToggle } from '@/components/navigation/themeModeToggle/ThemeModeToggle';
import { AppThemeProvider } from '@/app/AppThemeProvider';
import { renderWithProviders } from '@/test/render';
import { THEME_MODE_STORAGE_KEY } from '@/lib/themeMode';

function renderToggle() {
  return renderWithProviders(
    <AppThemeProvider>
      <ThemeModeToggle />
    </AppThemeProvider>,
  );
}

describe('ThemeModeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists dark mode selection', async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.click(screen.getByRole('button', { name: 'Theme' }));
    await user.click(screen.getByRole('menuitem', { name: 'Dark' }));

    expect(localStorage.getItem(THEME_MODE_STORAGE_KEY)).toBe('dark');
  });

  it('persists system mode selection', async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.click(screen.getByRole('button', { name: 'Theme' }));
    await user.click(screen.getByRole('menuitem', { name: 'System' }));

    expect(localStorage.getItem(THEME_MODE_STORAGE_KEY)).toBe('system');
  });
});
