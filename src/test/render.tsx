import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';

import { AppThemeProvider } from '@/app/AppThemeProvider';
import i18n from '@/app/i18n';
import type { RootState } from '@/app/store';
import { store } from '@/app/store';
import { baseApi } from '@/api/baseApi';
import '@/api/endpoints/authApi';
import '@/api/endpoints/companiesApi';
import '@/api/endpoints/membersApi';
import '@/api/endpoints/partnersApi';
import '@/api/endpoints/productsApi';
import '@/api/endpoints/requestsApi';
import '@/api/endpoints/quotesApi';
import '@/api/endpoints/selectionsApi';
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
  } as Parameters<typeof configureStore>[0]) as typeof store;
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
        <I18nextProvider i18n={i18n}>
          <AppThemeProvider>
            <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
              <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
            </SnackbarProvider>
          </AppThemeProvider>
        </I18nextProvider>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
