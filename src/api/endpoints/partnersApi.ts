import {
  getDeleteCompaniesCompanyIdPartnersLinkIdUrl,
  getGetCompaniesCompanyIdPartnersInvitationsUrl,
  getGetCompaniesCompanyIdPartnersUrl,
  getPostCompaniesCompanyIdPartnersInviteUrl,
  getPostCompaniesCompanyIdPartnersLinkIdAcceptUrl,
  getPostCompaniesCompanyIdPartnersLinkIdRejectUrl,
} from '@/api/generated/endpoints';
import type {
  GetCompaniesCompanyIdPartners200,
  GetCompaniesCompanyIdPartnersInvitations200,
  GetCompaniesCompanyIdPartnersInvitationsParams,
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
    { type: 'Partners' as const, id: `${companyId}-invitations` },
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
    listPartnerInvitations: builder.query<
      GetCompaniesCompanyIdPartnersInvitations200,
      CompanyScopedArgs<GetCompaniesCompanyIdPartnersInvitationsParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: getGetCompaniesCompanyIdPartnersInvitationsUrl(companyId, params),
        params,
      }),
      providesTags: (_result, _error, { companyId }) => [
        { type: 'Partners', id: `${companyId}-invitations` },
      ],
    }),
    invitePartner: builder.mutation<
      PostCompaniesCompanyIdPartnersInvite201,
      {
        /** Initiator company (path param). */
        companyId: string;
        email: string;
        /** Target partner company when contact is ambiguous (body.companyId). */
        targetCompanyId?: string;
      }
    >({
      query: ({ companyId, email, targetCompanyId }) => {
        const body: PostCompaniesCompanyIdPartnersInviteBody = {
          email,
          ...(targetCompanyId ? { companyId: targetCompanyId } : {}),
        };
        return {
          url: getPostCompaniesCompanyIdPartnersInviteUrl(companyId),
          method: 'POST',
          body,
        };
      },
      invalidatesTags: (_result, _error, { companyId }) =>
        partnerTags(companyId),
    }),
    cancelPartnerInvitation: builder.mutation<
      void,
      { companyId: string; linkId: string }
    >({
      query: ({ companyId, linkId }) => ({
        url: getDeleteCompaniesCompanyIdPartnersLinkIdUrl(companyId, linkId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { companyId }) =>
        partnerTags(companyId),
    }),
    /** Remove an active partner link (same DELETE as cancel invitation). */
    unlinkPartner: builder.mutation<
      void,
      { companyId: string; linkId: string }
    >({
      query: ({ companyId, linkId }) => ({
        url: getDeleteCompaniesCompanyIdPartnersLinkIdUrl(companyId, linkId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { companyId }) =>
        partnerTags(companyId),
    }),
    acceptPartner: builder.mutation<
      PostCompaniesCompanyIdPartnersLinkIdAccept200,
      { companyId: string; linkId: string }
    >({
      query: ({ companyId, linkId }) => ({
        url: getPostCompaniesCompanyIdPartnersLinkIdAcceptUrl(
          companyId,
          linkId,
        ),
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
        url: getPostCompaniesCompanyIdPartnersLinkIdRejectUrl(
          companyId,
          linkId,
        ),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { companyId }) =>
        partnerTags(companyId),
    }),
  }),
});

export const {
  useListPartnersQuery,
  useListPartnerInvitationsQuery,
  useInvitePartnerMutation,
  useCancelPartnerInvitationMutation,
  useUnlinkPartnerMutation,
  useAcceptPartnerMutation,
  useRejectPartnerMutation,
} = partnersApi;
