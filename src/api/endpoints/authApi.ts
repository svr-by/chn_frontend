import {
  getGetAuthMeUrl,
  getPatchAuthMeUrl,
  getPostAuthForgotPasswordUrl,
  getPostAuthLoginUrl,
  getPostAuthLogoutUrl,
  getPostAuthRefreshUrl,
  getPostAuthRegisterUrl,
  getPostAuthResendVerificationUrl,
  getPostAuthResetPasswordUrl,
  getPostAuthVerifyEmailUrl,
} from '@/api/generated/endpoints';
import type {
  GetAuthMe200,
  PatchAuthMe200,
  PatchAuthMeBody,
  PostAuthForgotPassword200,
  PostAuthForgotPasswordBody,
  PostAuthLogin200,
  PostAuthLoginBody,
  PostAuthLogoutBody,
  PostAuthRefreshBody,
  PostAuthRegister201,
  PostAuthRegisterBody,
  PostAuthResendVerification200,
  PostAuthResendVerificationBody,
  PostAuthResetPassword200,
  PostAuthResetPasswordBody,
  PostAuthVerifyEmail200,
  PostAuthVerifyEmailBody,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';
import {
  clearSession,
  setBootstrapped,
  setTokens,
} from '@/store/slices/authSlice';

export const authApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    register: builder.mutation<PostAuthRegister201, PostAuthRegisterBody>({
      query: (body) => ({
        url: getPostAuthRegisterUrl(),
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<PostAuthLogin200, PostAuthLoginBody>({
      query: (body) => ({
        url: getPostAuthLoginUrl(),
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
          // Force AuthBootstrap to re-run and restore activeCompanyId after
          // logout left isBootstrapped=true with a cleared company.
          dispatch(setBootstrapped(false));
        } catch {
          // handled by caller
        }
      },
      invalidatesTags: ['Me'],
    }),
    logout: builder.mutation<void, PostAuthLogoutBody>({
      query: (body) => ({
        url: getPostAuthLogoutUrl(),
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
      query: () => ({ url: getGetAuthMeUrl() }),
      providesTags: ['Me'],
    }),
    updateMe: builder.mutation<PatchAuthMe200, PatchAuthMeBody>({
      query: (body) => ({
        url: getPatchAuthMeUrl(),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Me'],
    }),
    refresh: builder.mutation<
      { accessToken: string; refreshToken: string },
      PostAuthRefreshBody
    >({
      query: (body) => ({
        url: getPostAuthRefreshUrl(),
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
    verifyEmail: builder.mutation<
      PostAuthVerifyEmail200,
      PostAuthVerifyEmailBody
    >({
      query: (body) => ({
        url: getPostAuthVerifyEmailUrl(),
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Me'],
    }),
    resendVerification: builder.mutation<
      PostAuthResendVerification200,
      PostAuthResendVerificationBody | void
    >({
      query: (body) => ({
        url: getPostAuthResendVerificationUrl(),
        method: 'POST',
        body: body ?? {},
      }),
    }),
    forgotPassword: builder.mutation<
      PostAuthForgotPassword200,
      PostAuthForgotPasswordBody
    >({
      query: (body) => ({
        url: getPostAuthForgotPasswordUrl(),
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<
      PostAuthResetPassword200,
      PostAuthResetPasswordBody
    >({
      query: (body) => ({
        url: getPostAuthResetPasswordUrl(),
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateMeMutation,
  useRefreshMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
