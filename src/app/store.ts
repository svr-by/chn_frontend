import { configureStore } from '@reduxjs/toolkit';

import { baseApi } from '@/api/baseApi';
import '@/api/endpoints/authApi';
import '@/api/endpoints/companiesApi';
import '@/api/endpoints/membersApi';
import '@/api/endpoints/partnersApi';
import '@/api/endpoints/productsApi';
import '@/api/endpoints/requestsApi';
import '@/api/endpoints/importsApi';
import '@/api/endpoints/quotesApi';
import '@/api/endpoints/selectionsApi';
import '@/api/endpoints/invoicesApi';
import '@/api/endpoints/paymentsApi';
import '@/api/endpoints/shippingInvoicesApi';
import '@/api/endpoints/consolidationsApi';
import '@/api/endpoints/commentsApi';
import '@/api/endpoints/notificationsApi';
import { authReducer } from '@/store/slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
