import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  readStoredThemeMode,
  writeStoredThemeMode,
  type ThemeMode,
} from '@/lib/themeMode';

interface ThemeModeContextValue {
  mode: ThemeMode;
  paletteMode: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => readStoredThemeMode());
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false,
  );

  useEffect(() => {
    if (mode !== 'system' || typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemDark(event.matches);
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [mode]);

  const paletteMode = useMemo<'light' | 'dark'>(() => {
    if (mode === 'system') {
      return systemDark ? 'dark' : 'light';
    }

    return mode;
  }, [mode, systemDark]);

  const setThemeMode = useCallback((nextMode: ThemeMode) => {
    writeStoredThemeMode(nextMode);
    setMode(nextMode);
  }, []);

  const value = useMemo(
    () => ({ mode, paletteMode, setThemeMode }),
    [mode, paletteMode, setThemeMode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }

  return context;
}
