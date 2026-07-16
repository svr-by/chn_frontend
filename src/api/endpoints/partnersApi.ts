import {
  getGetCompaniesCompanyIdPartnersDirectoryUrl,
  getGetCompaniesCompanyIdPartnersInboundUrl,
  getGetCompaniesCompanyIdPartnersOutboundUrl,
  getGetCompaniesCompanyIdPartnersUrl,
  getPostCompaniesCompanyIdPartnersInviteUrl,
  getPostCompaniesCompanyIdPartnersLinkIdAcceptUrl,
  getPostCompaniesCompanyIdPartnersLinkIdRejectUrl,
} from '@/api/generated/endpoints';
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
        url: getGetCompaniesCompanyIdPartnersUrl(companyId),
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
        url: getGetCompaniesCompanyIdPartnersInboundUrl(companyId),
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
        url: getGetCompaniesCompanyIdPartnersOutboundUrl(companyId),
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
        url: getGetCompaniesCompanyIdPartnersDirectoryUrl(companyId),
        params,
      }),
    }),
    invitePartner: builder.mutation<
      PostCompaniesCompanyIdPartnersInvite201,
      CompanyScopedArgs<PostCompaniesCompanyIdPartnersInviteBody>
    >({
      query: ({ companyId, ...body }) => ({
        url: getPostCompaniesCompanyIdPartnersInviteUrl(companyId),
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
        url: getPostCompaniesCompanyIdPartnersLinkIdAcceptUrl(companyId, linkId),
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
        url: getPostCompaniesCompanyIdPartnersLinkIdRejectUrl(companyId, linkId),
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
