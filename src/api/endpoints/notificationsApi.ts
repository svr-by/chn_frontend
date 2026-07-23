import {
  getGetCompaniesCompanyIdNotificationsUnreadCountUrl,
  getGetCompaniesCompanyIdNotificationsUrl,
  getPostCompaniesCompanyIdNotificationsNotificationIdReadUrl,
  getPostCompaniesCompanyIdNotificationsReadAllUrl,
} from '@/api/generated/endpoints';
import type {
  GetCompaniesCompanyIdNotifications200,
  GetCompaniesCompanyIdNotificationsParams,
  GetCompaniesCompanyIdNotificationsUnreadCount200,
  PostCompaniesCompanyIdNotificationsNotificationIdRead200,
  PostCompaniesCompanyIdNotificationsReadAll200,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

type CompanyScopedArgs<T = void> = T extends void
  ? { companyId: string }
  : { companyId: string } & T;

function notificationListTag(companyId: string) {
  return [{ type: 'Notifications' as const, id: companyId }];
}

function notificationUnreadCountTag(companyId: string) {
  return [{ type: 'NotificationUnreadCount' as const, id: companyId }];
}

function notificationTags(companyId: string) {
  return [
    ...notificationListTag(companyId),
    ...notificationUnreadCountTag(companyId),
  ];
}

export const notificationsApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listNotifications: builder.query<
      GetCompaniesCompanyIdNotifications200,
      CompanyScopedArgs<GetCompaniesCompanyIdNotificationsParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: getGetCompaniesCompanyIdNotificationsUrl(companyId),
        params,
      }),
      providesTags: (_result, _error, { companyId }) =>
        notificationListTag(companyId),
    }),
    getUnreadNotificationCount: builder.query<
      GetCompaniesCompanyIdNotificationsUnreadCount200,
      { companyId: string }
    >({
      query: ({ companyId }) => ({
        url: getGetCompaniesCompanyIdNotificationsUnreadCountUrl(companyId),
      }),
      providesTags: (_result, _error, { companyId }) =>
        notificationUnreadCountTag(companyId),
    }),
    markNotificationRead: builder.mutation<
      PostCompaniesCompanyIdNotificationsNotificationIdRead200,
      { companyId: string; notificationId: string }
    >({
      query: ({ companyId, notificationId }) => ({
        url: getPostCompaniesCompanyIdNotificationsNotificationIdReadUrl(
          companyId,
          notificationId,
        ),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { companyId }) =>
        notificationTags(companyId),
    }),
    markAllNotificationsRead: builder.mutation<
      PostCompaniesCompanyIdNotificationsReadAll200,
      { companyId: string }
    >({
      query: ({ companyId }) => ({
        url: getPostCompaniesCompanyIdNotificationsReadAllUrl(companyId),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { companyId }) =>
        notificationTags(companyId),
    }),
  }),
});

export const {
  useListNotificationsQuery,
  useLazyListNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
