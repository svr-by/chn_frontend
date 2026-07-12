import { createTheme, type PaletteMode } from '@mui/material/styles';

export function createAppTheme(mode: PaletteMode = 'light') {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#1565c0',
      },
      secondary: {
        main: '#455a64',
      },
      background: {
        default: mode === 'light' ? '#f5f7fa' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily:
        '"Inter", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
  });
}

/** @deprecated Use createAppTheme(mode) via AppThemeProvider */
export const theme = createAppTheme('light');
