import {
  getDeleteCompaniesCompanyIdMembersInvitationsInvitationIdUrl,
  getDeleteCompaniesCompanyIdMembersMemberIdUrl,
  getGetCompaniesCompanyIdMembersInvitationsUrl,
  getGetCompaniesCompanyIdMembersUrl,
  getPatchCompaniesCompanyIdMembersMemberIdPermissionsUrl,
  getPatchCompaniesCompanyIdMembersMemberIdUrl,
  getPostCompaniesCompanyIdMembersInviteUrl,
} from '@/api/generated/endpoints';
import type {
  GetCompaniesCompanyIdMembers200,
  GetCompaniesCompanyIdMembersInvitations200,
  GetCompaniesCompanyIdMembersInvitationsParams,
  GetCompaniesCompanyIdMembersParams,
  PatchCompaniesCompanyIdMembersMemberId200,
  PatchCompaniesCompanyIdMembersMemberIdBody,
  PatchCompaniesCompanyIdMembersMemberIdPermissions200,
  PatchCompaniesCompanyIdMembersMemberIdPermissionsBody,
  PostCompaniesCompanyIdMembersInvite201,
  PostCompaniesCompanyIdMembersInviteBody,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

type CompanyScopedArgs<T = void> = T extends void
  ? { companyId: string }
  : { companyId: string } & T;

export const membersApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listMembers: builder.query<
      GetCompaniesCompanyIdMembers200,
      CompanyScopedArgs<GetCompaniesCompanyIdMembersParams | void>
    >({
      query: ({ companyId, ...params }) => ({
        url: getGetCompaniesCompanyIdMembersUrl(companyId),
        params,
      }),
      providesTags: (_result, _error, { companyId }) => [
        { type: 'Members', id: companyId },
      ],
    }),
    inviteMember: builder.mutation<
      PostCompaniesCompanyIdMembersInvite201,
      CompanyScopedArgs<PostCompaniesCompanyIdMembersInviteBody>
    >({
      query: ({ companyId, ...body }) => ({
        url: getPostCompaniesCompanyIdMembersInviteUrl(companyId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId }) => [
        { type: 'Invitations', id: companyId },
        'Me',
      ],
    }),
    listInvitations: builder.query<
      GetCompaniesCompanyIdMembersInvitations200,
      CompanyScopedArgs<GetCompaniesCompanyIdMembersInvitationsParams | void>
    >({
      query: ({ companyId, ...params }) => ({
        url: getGetCompaniesCompanyIdMembersInvitationsUrl(companyId),
        params,
      }),
      providesTags: (_result, _error, { companyId }) => [
        { type: 'Invitations', id: companyId },
      ],
    }),
    revokeInvitation: builder.mutation<
      void,
      { companyId: string; invitationId: string }
    >({
      query: ({ companyId, invitationId }) => ({
        url: getDeleteCompaniesCompanyIdMembersInvitationsInvitationIdUrl(companyId, invitationId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { companyId }) => [
        { type: 'Invitations', id: companyId },
      ],
    }),
    removeMember: builder.mutation<void, { companyId: string; memberId: string }>({
      query: ({ companyId, memberId }) => ({
        url: getDeleteCompaniesCompanyIdMembersMemberIdUrl(companyId, memberId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { companyId }) => [
        { type: 'Members', id: companyId },
        'Me',
      ],
    }),
    updateMember: builder.mutation<
      PatchCompaniesCompanyIdMembersMemberId200,
      {
        companyId: string;
        memberId: string;
        body: PatchCompaniesCompanyIdMembersMemberIdBody;
      }
    >({
      query: ({ companyId, memberId, body }) => ({
        url: getPatchCompaniesCompanyIdMembersMemberIdUrl(companyId, memberId),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId }) => [
        { type: 'Members', id: companyId },
        'Me',
      ],
    }),
    updateMemberPermissions: builder.mutation<
      PatchCompaniesCompanyIdMembersMemberIdPermissions200,
      {
        companyId: string;
        memberId: string;
        body: PatchCompaniesCompanyIdMembersMemberIdPermissionsBody;
      }
    >({
      query: ({ companyId, memberId, body }) => ({
        url: getPatchCompaniesCompanyIdMembersMemberIdPermissionsUrl(companyId, memberId),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId }) => [
        { type: 'Members', id: companyId },
        'Me',
      ],
    }),
  }),
});

export const {
  useListMembersQuery,
  useInviteMemberMutation,
  useListInvitationsQuery,
  useRevokeInvitationMutation,
  useRemoveMemberMutation,
  useUpdateMemberMutation,
  useUpdateMemberPermissionsMutation,
} = membersApi;
