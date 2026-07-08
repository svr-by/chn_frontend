import type {
  GetAuthMe200,
  PostAuthLogin200,
  PostAuthLoginBody,
  PostAuthLogoutBody,
  PostAuthRefreshBody,
  PostAuthRegister201,
  PostAuthRegisterBody,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';
import { clearSession, setTokens } from '@/store/slices/authSlice';

export const authApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    register: builder.mutation<PostAuthRegister201, PostAuthRegisterBody>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<PostAuthLogin200, PostAuthLoginBody>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setTokens({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            }),
          );
        } catch {
          // handled by caller
        }
      },
      invalidatesTags: ['Me'],
    }),
    logout: builder.mutation<void, PostAuthLogoutBody>({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearSession());
          dispatch(authApi.util.resetApiState());
        }
      },
    }),
    getMe: builder.query<GetAuthMe200, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),
    refresh: builder.mutation<
      { accessToken: string; refreshToken: string },
      PostAuthRefreshBody
    >({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(
          setTokens({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          }),
        );
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useRefreshMutation,
} = authApi;
