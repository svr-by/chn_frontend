import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';

import i18n from '@/app/i18n';
import { theme } from '@/app/theme';
import type { RootState } from '@/app/store';
import { baseApi } from '@/api/baseApi';
import '@/api/endpoints/authApi';
import '@/api/endpoints/companiesApi';
import '@/api/endpoints/membersApi';
import '@/api/endpoints/partnersApi';
import '@/api/endpoints/productsApi';
import '@/api/endpoints/requestsApi';
import { authReducer } from '@/store/slices/authSlice';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  route?: string;
}

export function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
    preloadedState,
  });
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    route = '/',
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  const store = createTestStore(preloadedState);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <I18nextProvider i18n={i18n}>
            <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
              <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
            </SnackbarProvider>
          </I18nextProvider>
        </ThemeProvider>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
