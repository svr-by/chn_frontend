import type {
  GetCompanies200,
  GetCompaniesCompanyId200,
  PostCompanies201,
  PostCompaniesBody,
  PostCompaniesCompanyIdMembersAccept200,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

export const companiesApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listCompanies: builder.query<GetCompanies200, void>({
      query: () => '/companies',
      providesTags: ['Companies'],
    }),
    createCompany: builder.mutation<PostCompanies201, PostCompaniesBody>({
      query: (body) => ({
        url: '/companies',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Companies', 'Me'],
    }),
    getCompany: builder.query<GetCompaniesCompanyId200, string>({
      query: (companyId) => `/companies/${companyId}`,
      providesTags: (_result, _error, companyId) => [
        { type: 'Company', id: companyId },
      ],
    }),
    acceptInvite: builder.mutation<
      PostCompaniesCompanyIdMembersAccept200,
      string
    >({
      query: (companyId) => ({
        url: `/companies/${companyId}/members/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['Me', 'Companies'],
    }),
  }),
});

export const {
  useListCompaniesQuery,
  useCreateCompanyMutation,
  useGetCompanyQuery,
  useAcceptInviteMutation,
} = companiesApi;
