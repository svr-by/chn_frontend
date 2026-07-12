import type { CommentDocumentType } from '@/api/generated/models/commentDocumentType';
import type {
  DocumentRelationships,
  GetCompaniesCompanyIdTraceLineageIdEvents200,
  GetCompaniesCompanyIdTraceLineageIdEventsParams,
  GetCompaniesCompanyIdTraceSearch200,
  GetCompaniesCompanyIdTraceSearchParams,
  LineageTrace,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

type DocumentScopedArgs = {
  companyId: string;
  documentType: CommentDocumentType;
  documentId: string;
};

function lineageTraceTag(lineageId: string) {
  return [{ type: 'LineageTrace' as const, id: lineageId }];
}

function lineageEventsTag(lineageId: string) {
  return [{ type: 'LineageEvents' as const, id: lineageId }];
}

function documentRelationshipsTag(
  documentType: CommentDocumentType,
  documentId: string,
) {
  return [
    {
      type: 'DocumentRelationships' as const,
      id: `${documentType}-${documentId}`,
    },
  ];
}

export const traceApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    searchTrace: builder.query<
      GetCompaniesCompanyIdTraceSearch200,
      { companyId: string } & GetCompaniesCompanyIdTraceSearchParams
    >({
      query: ({ companyId, ...params }) => ({
        url: `/companies/${companyId}/trace/search`,
        params,
      }),
      providesTags: (_result, _error, { companyId }) => [
        { type: 'Trace', id: companyId },
      ],
    }),
    getLineageTrace: builder.query<
      LineageTrace,
      { companyId: string; lineageId: string }
    >({
      query: ({ companyId, lineageId }) => ({
        url: `/companies/${companyId}/trace/${lineageId}`,
      }),
      providesTags: (_result, _error, { lineageId }) => lineageTraceTag(lineageId),
    }),
    getLineageEvents: builder.query<
      GetCompaniesCompanyIdTraceLineageIdEvents200,
      {
        companyId: string;
        lineageId: string;
      } & GetCompaniesCompanyIdTraceLineageIdEventsParams
    >({
      query: ({ companyId, lineageId, ...params }) => ({
        url: `/companies/${companyId}/trace/${lineageId}/events`,
        params,
      }),
      providesTags: (_result, _error, { lineageId }) => lineageEventsTag(lineageId),
    }),
    getDocumentRelationships: builder.query<
      DocumentRelationships,
      DocumentScopedArgs
    >({
      query: ({ companyId, documentType, documentId }) => ({
        url: `/companies/${companyId}/documents/${documentType}/${documentId}/relationships`,
      }),
      providesTags: (_result, _error, { documentType, documentId }) =>
        documentRelationshipsTag(documentType, documentId),
    }),
  }),
});

export const {
  useSearchTraceQuery,
  useGetLineageTraceQuery,
  useGetLineageEventsQuery,
  useLazyGetLineageEventsQuery,
  useGetDocumentRelationshipsQuery,
} = traceApi;
