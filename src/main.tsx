import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';

import { router } from '@/app/router';
import { store } from '@/app/store';
import { theme } from '@/app/theme';
import i18n from '@/app/i18n';

import '@/styles/global.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <I18nextProvider i18n={i18n}>
          <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
            <RouterProvider router={router} />
          </SnackbarProvider>
        </I18nextProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
