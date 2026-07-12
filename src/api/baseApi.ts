import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { authStorage } from '@/lib/authStorage';
import { getUiLocale } from '@/lib/locale';
import { clearSession, setTokens } from '@/store/slices/authSlice';
import type { ApiError } from '@/types/api';

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(
  rawBaseQuery: ReturnType<typeof fetchBaseQuery>,
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2],
): Promise<boolean> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  const refreshResult = await rawBaseQuery(
    {
      url: '/auth/refresh',
      method: 'POST',
      body: { refreshToken },
    },
    api,
    extraOptions,
  );

  if (!refreshResult.data) {
    return false;
  }

  const data = refreshResult.data as {
    accessToken: string;
    refreshToken: string;
  };
  api.dispatch(
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }),
  );
  return true;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const accessToken = authStorage.getAccessToken();
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const state = getState() as { auth: { activeCompanyId: string | null } };
    const activeCompanyId = state.auth.activeCompanyId;
    if (activeCompanyId) {
      headers.set('X-Company-Id', activeCompanyId);
    }

    headers.set('Accept-Language', getUiLocale());

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const requestUrl = typeof args === 'string' ? args : args.url;
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh');

    if (isAuthEndpoint || !authStorage.getRefreshToken()) {
      api.dispatch(clearSession());
      return result;
    }

    if (!refreshPromise) {
      refreshPromise = refreshTokens(rawBaseQuery, api, extraOptions).finally(
        () => {
          refreshPromise = null;
        },
      );
    }

    const refreshed = await refreshPromise;
    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearSession());
    }
  }

  return result;
};

export function isApiError(data: unknown): data is ApiError {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as ApiError).error?.code === 'string'
  );
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Me',
    'Companies',
    'Company',
    'Members',
    'Invitations',
    'Partners',
    'Products',
    'Requests',
    'Imports',
    'Quotes',
    'Selections',
    'Invoices',
    'Payments',
    'ShippingInvoices',
    'Consolidations',
    'Comments',
    'Activity',
    'Notifications',
    'NotificationUnreadCount',
    'Trace',
    'LineageTrace',
    'LineageEvents',
    'DocumentRelationships',
    'IntegrationApiKeys',
    'IntegrationMappings',
    'IntegrationWebhooks',
    'IntegrationExports',
  ],
  endpoints: () => ({}),
});
