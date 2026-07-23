import {
  getGetCompaniesCompanyIdDocumentsDocumentTypeDocumentIdActivityUrl,
  getGetCompaniesCompanyIdDocumentsDocumentTypeDocumentIdCommentsUrl,
  getPostCompaniesCompanyIdDocumentsDocumentTypeDocumentIdCommentsUrl,
} from '@/api/generated/endpoints';
import type { CommentDocumentType } from '@/api/generated/models/commentDocumentType';
import type {
  GetCompaniesCompanyIdDocumentsDocumentTypeDocumentIdActivity200,
  GetCompaniesCompanyIdDocumentsDocumentTypeDocumentIdActivityParams,
  GetCompaniesCompanyIdDocumentsDocumentTypeDocumentIdComments200,
  GetCompaniesCompanyIdDocumentsDocumentTypeDocumentIdCommentsParams,
  PostCompaniesCompanyIdDocumentsDocumentTypeDocumentIdComments201,
  PostCompaniesCompanyIdDocumentsDocumentTypeDocumentIdCommentsBody,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

type DocumentScopedArgs<T = Record<string, never>> = {
  companyId: string;
  documentType: CommentDocumentType;
  documentId: string;
} & T;

function documentCommentsTag(
  documentType: CommentDocumentType,
  documentId: string,
) {
  return [{ type: 'Comments' as const, id: `${documentType}-${documentId}` }];
}

function documentActivityTag(
  documentType: CommentDocumentType,
  documentId: string,
) {
  return [{ type: 'Activity' as const, id: `${documentType}-${documentId}` }];
}

function notificationTags(companyId: string) {
  return [
    { type: 'Notifications' as const, id: companyId },
    { type: 'NotificationUnreadCount' as const, id: companyId },
  ];
}

export const commentsApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listDocumentComments: builder.query<
      GetCompaniesCompanyIdDocumentsDocumentTypeDocumentIdComments200,
      DocumentScopedArgs<GetCompaniesCompanyIdDocumentsDocumentTypeDocumentIdCommentsParams>
    >({
      query: ({ companyId, documentType, documentId, ...params }) => ({
        url: getGetCompaniesCompanyIdDocumentsDocumentTypeDocumentIdCommentsUrl(
          companyId,
          documentType,
          documentId,
        ),
        params,
      }),
      providesTags: (_result, _error, { documentType, documentId }) =>
        documentCommentsTag(documentType, documentId),
    }),
    createDocumentComment: builder.mutation<
      PostCompaniesCompanyIdDocumentsDocumentTypeDocumentIdComments201,
      DocumentScopedArgs<PostCompaniesCompanyIdDocumentsDocumentTypeDocumentIdCommentsBody>
    >({
      query: ({ companyId, documentType, documentId, ...body }) => ({
        url: getPostCompaniesCompanyIdDocumentsDocumentTypeDocumentIdCommentsUrl(
          companyId,
          documentType,
          documentId,
        ),
        method: 'POST',
        body,
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, documentType, documentId },
      ) => [
        ...documentCommentsTag(documentType, documentId),
        ...documentActivityTag(documentType, documentId),
        ...notificationTags(companyId),
      ],
    }),
    listDocumentActivity: builder.query<
      GetCompaniesCompanyIdDocumentsDocumentTypeDocumentIdActivity200,
      DocumentScopedArgs<GetCompaniesCompanyIdDocumentsDocumentTypeDocumentIdActivityParams>
    >({
      query: ({ companyId, documentType, documentId, ...params }) => ({
        url: getGetCompaniesCompanyIdDocumentsDocumentTypeDocumentIdActivityUrl(
          companyId,
          documentType,
          documentId,
        ),
        params,
      }),
      providesTags: (_result, _error, { documentType, documentId }) =>
        documentActivityTag(documentType, documentId),
    }),
  }),
});

export const {
  useListDocumentCommentsQuery,
  useLazyListDocumentCommentsQuery,
  useCreateDocumentCommentMutation,
  useListDocumentActivityQuery,
  useLazyListDocumentActivityQuery,
} = commentsApi;
