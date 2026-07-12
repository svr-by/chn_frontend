import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';

import { AppThemeProvider } from '@/app/AppThemeProvider';
import { router } from '@/app/router';
import { store } from '@/app/store';
import i18n from '@/app/i18n';

import '@/styles/global.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <AppThemeProvider>
          <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
            <RouterProvider router={router} />
          </SnackbarProvider>
        </AppThemeProvider>
      </I18nextProvider>
    </Provider>
  </StrictMode>,
);
