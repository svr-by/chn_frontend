import { CssBaseline, ThemeProvider } from '@mui/material';
import { useMemo, type ReactNode } from 'react';

import { createAppTheme } from '@/app/theme';
import { ThemeModeProvider, useThemeMode } from '@/hooks/useThemeMode';

interface AppThemeProviderProps {
  children: ReactNode;
}

function ThemedApp({ children }: AppThemeProviderProps) {
  const { paletteMode } = useThemeMode();
  const theme = useMemo(() => createAppTheme(paletteMode), [paletteMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  return (
    <ThemeModeProvider>
      <ThemedApp>{children}</ThemedApp>
    </ThemeModeProvider>
  );
}
