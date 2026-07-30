import { getStoredItem, setStoredItem } from '@/lib/browserStorage';

export const THEME_MODE_STORAGE_KEY = 'chn_theme';

export const THEME_MODES = ['light', 'dark', 'system'] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export function isThemeMode(
  value: string | null | undefined,
): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function readStoredThemeMode(): ThemeMode {
  const stored = getStoredItem(THEME_MODE_STORAGE_KEY);
  return isThemeMode(stored) ? stored : 'system';
}

export function writeStoredThemeMode(mode: ThemeMode): void {
  setStoredItem(THEME_MODE_STORAGE_KEY, mode);
}

export function resolvePaletteMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window === 'undefined') {
      return 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  return mode;
}
