import {
  getGetCompaniesCompanyIdUrl,
  getGetCompaniesUrl,
  getPatchCompaniesCompanyIdUrl,
  getPostCompaniesCompanyIdDeactivateUrl,
  getPostCompaniesCompanyIdMembersAcceptUrl,
  getPostCompaniesCompanyIdReactivateUrl,
  getPostCompaniesUrl,
} from '@/api/generated/endpoints';
import type {
  GetCompanies200,
  GetCompaniesCompanyId200,
  PatchCompaniesCompanyId200,
  PatchCompaniesCompanyIdBody,
  PostCompanies201,
  PostCompaniesBody,
  PostCompaniesCompanyIdDeactivate200,
  PostCompaniesCompanyIdMembersAccept200,
  PostCompaniesCompanyIdReactivate200,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

export const companiesApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listCompanies: builder.query<GetCompanies200, void>({
      query: () => ({ url: getGetCompaniesUrl() }),
      providesTags: ['Companies'],
    }),
    createCompany: builder.mutation<PostCompanies201, PostCompaniesBody>({
      query: (body) => ({
        url: getPostCompaniesUrl(),
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Companies', 'Me'],
    }),
    getCompany: builder.query<GetCompaniesCompanyId200, string>({
      query: (companyId) => ({ url: getGetCompaniesCompanyIdUrl(companyId) }),
      providesTags: (_result, _error, companyId) => [
        { type: 'Company', id: companyId },
      ],
    }),
    updateCompany: builder.mutation<
      PatchCompaniesCompanyId200,
      { companyId: string } & PatchCompaniesCompanyIdBody
    >({
      query: ({ companyId, ...body }) => ({
        url: getPatchCompaniesCompanyIdUrl(companyId),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId }) => [
        'Companies',
        'Me',
        { type: 'Company', id: companyId },
      ],
    }),
    acceptInvite: builder.mutation<
      PostCompaniesCompanyIdMembersAccept200,
      string
    >({
      query: (companyId) => ({
        url: getPostCompaniesCompanyIdMembersAcceptUrl(companyId),
        method: 'POST',
      }),
      invalidatesTags: ['Me', 'Companies'],
    }),
    deactivateCompany: builder.mutation<
      PostCompaniesCompanyIdDeactivate200,
      string
    >({
      query: (companyId) => ({
        url: getPostCompaniesCompanyIdDeactivateUrl(companyId),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, companyId) => [
        'Companies',
        'Me',
        { type: 'Company', id: companyId },
      ],
    }),
    reactivateCompany: builder.mutation<
      PostCompaniesCompanyIdReactivate200,
      string
    >({
      query: (companyId) => ({
        url: getPostCompaniesCompanyIdReactivateUrl(companyId),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, companyId) => [
        'Companies',
        'Me',
        { type: 'Company', id: companyId },
      ],
    }),
  }),
});

export const {
  useListCompaniesQuery,
  useCreateCompanyMutation,
  useGetCompanyQuery,
  useUpdateCompanyMutation,
  useAcceptInviteMutation,
  useDeactivateCompanyMutation,
  useReactivateCompanyMutation,
} = companiesApi;
