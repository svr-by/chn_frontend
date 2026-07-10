import type {
  GetCompaniesCompanyIdPartners200,
  GetCompaniesCompanyIdPartnersDirectory200,
  GetCompaniesCompanyIdPartnersDirectoryParams,
  GetCompaniesCompanyIdPartnersInbound200,
  GetCompaniesCompanyIdPartnersOutbound200,
  PostCompaniesCompanyIdPartnersInvite201,
  PostCompaniesCompanyIdPartnersInviteBody,
  PostCompaniesCompanyIdPartnersLinkIdAccept200,
  PostCompaniesCompanyIdPartnersLinkIdReject200,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

type CompanyScopedArgs<T = void> = T extends void
  ? { companyId: string }
  : { companyId: string } & T;

function partnerTags(companyId: string) {
  return [
    { type: 'Partners' as const, id: companyId },
    { type: 'Partners' as const, id: `${companyId}-inbound` },
    { type: 'Partners' as const, id: `${companyId}-outbound` },
  ];
}

export const partnersApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listPartners: builder.query<
      GetCompaniesCompanyIdPartners200,
      CompanyScopedArgs
    >({
      query: ({ companyId }) => ({
        url: `/companies/${companyId}/partners`,
      }),
      providesTags: (_result, _error, { companyId }) => [
        { type: 'Partners', id: companyId },
      ],
    }),
    listInboundPartners: builder.query<
      GetCompaniesCompanyIdPartnersInbound200,
      CompanyScopedArgs
    >({
      query: ({ companyId }) => ({
        url: `/companies/${companyId}/partners/inbound`,
      }),
      providesTags: (_result, _error, { companyId }) => [
        { type: 'Partners', id: `${companyId}-inbound` },
      ],
    }),
    listOutboundPartners: builder.query<
      GetCompaniesCompanyIdPartnersOutbound200,
      CompanyScopedArgs
    >({
      query: ({ companyId }) => ({
        url: `/companies/${companyId}/partners/outbound`,
      }),
      providesTags: (_result, _error, { companyId }) => [
        { type: 'Partners', id: `${companyId}-outbound` },
      ],
    }),
    searchPartnerDirectory: builder.query<
      GetCompaniesCompanyIdPartnersDirectory200,
      CompanyScopedArgs<GetCompaniesCompanyIdPartnersDirectoryParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: `/companies/${companyId}/partners/directory`,
        params,
      }),
    }),
    invitePartner: builder.mutation<
      PostCompaniesCompanyIdPartnersInvite201,
      CompanyScopedArgs<PostCompaniesCompanyIdPartnersInviteBody>
    >({
      query: ({ companyId, ...body }) => ({
        url: `/companies/${companyId}/partners/invite`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId }) =>
        partnerTags(companyId),
    }),
    acceptPartner: builder.mutation<
      PostCompaniesCompanyIdPartnersLinkIdAccept200,
      { companyId: string; linkId: string }
    >({
      query: ({ companyId, linkId }) => ({
        url: `/companies/${companyId}/partners/${linkId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { companyId }) =>
        partnerTags(companyId),
    }),
    rejectPartner: builder.mutation<
      PostCompaniesCompanyIdPartnersLinkIdReject200,
      { companyId: string; linkId: string }
    >({
      query: ({ companyId, linkId }) => ({
        url: `/companies/${companyId}/partners/${linkId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { companyId }) =>
        partnerTags(companyId),
    }),
  }),
});

export const {
  useListPartnersQuery,
  useListInboundPartnersQuery,
  useListOutboundPartnersQuery,
  useSearchPartnerDirectoryQuery,
  useInvitePartnerMutation,
  useAcceptPartnerMutation,
  useRejectPartnerMutation,
} = partnersApi;
