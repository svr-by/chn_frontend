import {
  getDeleteCompaniesCompanyIdRequestsRequestIdLinesLineIdUrl,
  getDeleteCompaniesCompanyIdRequestsRequestIdUrl,
  getGetCompaniesCompanyIdRequestLinesInboundUrl,
  getGetCompaniesCompanyIdRequestLinesUrl,
  getGetCompaniesCompanyIdRequestsInboundRequestIdUrl,
  getGetCompaniesCompanyIdRequestsInboundUrl,
  getGetCompaniesCompanyIdRequestsRequestIdBillableLinesUrl,
  getGetCompaniesCompanyIdRequestsRequestIdDistributionsUrl,
  getGetCompaniesCompanyIdRequestsRequestIdQuotesComparisonUrl,
  getGetCompaniesCompanyIdRequestsRequestIdSelectionUrl,
  getGetCompaniesCompanyIdRequestsRequestIdUrl,
  getGetCompaniesCompanyIdRequestsUrl,
  getPatchCompaniesCompanyIdRequestsRequestIdLinesLineIdUrl,
  getPatchCompaniesCompanyIdRequestsRequestIdUrl,
  getPostCompaniesCompanyIdRequestsInboundRequestIdRejectUrl,
  getPostCompaniesCompanyIdRequestsRequestIdDistributeUrl,
  getPostCompaniesCompanyIdRequestsRequestIdLinesUrl,
  getPostCompaniesCompanyIdRequestsUrl,
} from '@/api/generated/endpoints';
import type {
  DeleteCompaniesCompanyIdRequestsRequestIdLinesLineId200,
  GetCompaniesCompanyIdRequestLines200,
  GetCompaniesCompanyIdRequestLinesInbound200,
  GetCompaniesCompanyIdRequestLinesInboundParams,
  GetCompaniesCompanyIdRequestLinesParams,
  GetCompaniesCompanyIdRequests200,
  GetCompaniesCompanyIdRequestsInbound200,
  GetCompaniesCompanyIdRequestsInboundParams,
  GetCompaniesCompanyIdRequestsInboundRequestId200,
  GetCompaniesCompanyIdRequestsParams,
  GetCompaniesCompanyIdRequestsRequestId200,
  GetCompaniesCompanyIdRequestsRequestIdBillableLines200,
  GetCompaniesCompanyIdRequestsRequestIdDistributions200,
  GetCompaniesCompanyIdRequestsRequestIdQuotesComparison200,
  GetCompaniesCompanyIdRequestsRequestIdSelection200,
  PatchCompaniesCompanyIdRequestsRequestId200,
  PatchCompaniesCompanyIdRequestsRequestIdBody,
  PatchCompaniesCompanyIdRequestsRequestIdLinesLineId200,
  PatchCompaniesCompanyIdRequestsRequestIdLinesLineIdBody,
  PostCompaniesCompanyIdRequests201,
  PostCompaniesCompanyIdRequestsBody,
  PostCompaniesCompanyIdRequestsInboundRequestIdReject200,
  PostCompaniesCompanyIdRequestsInboundRequestIdRejectBody,
  PostCompaniesCompanyIdRequestsRequestIdDistribute200,
  PostCompaniesCompanyIdRequestsRequestIdDistributeBody,
  PostCompaniesCompanyIdRequestsRequestIdLines201,
  PostCompaniesCompanyIdRequestsRequestIdLinesBody,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

type CompanyScopedArgs<T = void> = T extends void
  ? { companyId: string }
  : { companyId: string } & T;

function requestListTag(companyId: string) {
  return [{ type: 'Requests' as const, id: companyId }];
}

function requestDetailTags(companyId: string, requestId: string) {
  return [
    { type: 'Requests' as const, id: companyId },
    { type: 'Requests' as const, id: requestId },
  ];
}

function inboundTags(companyId: string) {
  return [
    { type: 'Requests' as const, id: `${companyId}-inbound` },
    { type: 'Requests' as const, id: `${companyId}-inbound-lines` },
  ];
}

export const requestsApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listRequests: builder.query<
      GetCompaniesCompanyIdRequests200,
      CompanyScopedArgs<GetCompaniesCompanyIdRequestsParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: getGetCompaniesCompanyIdRequestsUrl(companyId),
        params,
      }),
      providesTags: (_result, _error, { companyId }) => requestListTag(companyId),
    }),
    listRequestLines: builder.query<
      GetCompaniesCompanyIdRequestLines200,
      CompanyScopedArgs<GetCompaniesCompanyIdRequestLinesParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: getGetCompaniesCompanyIdRequestLinesUrl(companyId),
        params,
      }),
      providesTags: (_result, _error, { companyId }) => requestListTag(companyId),
    }),
    listInboundRequestLines: builder.query<
      GetCompaniesCompanyIdRequestLinesInbound200,
      CompanyScopedArgs<GetCompaniesCompanyIdRequestLinesInboundParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: getGetCompaniesCompanyIdRequestLinesInboundUrl(companyId),
        params,
      }),
      providesTags: (_result, _error, { companyId }) => [
        { type: 'Requests', id: `${companyId}-inbound-lines` },
      ],
    }),
    getRequest: builder.query<
      GetCompaniesCompanyIdRequestsRequestId200,
      { companyId: string; requestId: string }
    >({
      query: ({ companyId, requestId }) => ({
        url: getGetCompaniesCompanyIdRequestsRequestIdUrl(companyId, requestId),
      }),
      providesTags: (_result, _error, { requestId }) => [
        { type: 'Requests', id: requestId },
      ],
    }),
    getInboundRequest: builder.query<
      GetCompaniesCompanyIdRequestsInboundRequestId200,
      { companyId: string; requestId: string }
    >({
      query: ({ companyId, requestId }) => ({
        url: getGetCompaniesCompanyIdRequestsInboundRequestIdUrl(companyId, requestId),
      }),
      providesTags: (_result, _error, { companyId, requestId }) => [
        ...inboundTags(companyId),
        { type: 'Requests', id: `${requestId}-inbound` },
      ],
    }),
    createRequest: builder.mutation<
      PostCompaniesCompanyIdRequests201,
      CompanyScopedArgs<PostCompaniesCompanyIdRequestsBody>
    >({
      query: ({ companyId, ...body }) => ({
        url: getPostCompaniesCompanyIdRequestsUrl(companyId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId }) =>
        requestListTag(companyId),
    }),
    updateRequest: builder.mutation<
      PatchCompaniesCompanyIdRequestsRequestId200,
      {
        companyId: string;
        requestId: string;
      } & PatchCompaniesCompanyIdRequestsRequestIdBody
    >({
      query: ({ companyId, requestId, ...body }) => ({
        url: getPatchCompaniesCompanyIdRequestsRequestIdUrl(companyId, requestId),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, requestId }) =>
        requestDetailTags(companyId, requestId),
    }),
    addRequestLine: builder.mutation<
      PostCompaniesCompanyIdRequestsRequestIdLines201,
      {
        companyId: string;
        requestId: string;
      } & PostCompaniesCompanyIdRequestsRequestIdLinesBody
    >({
      query: ({ companyId, requestId, ...body }) => ({
        url: getPostCompaniesCompanyIdRequestsRequestIdLinesUrl(companyId, requestId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, requestId }) =>
        requestDetailTags(companyId, requestId),
    }),
    updateRequestLine: builder.mutation<
      PatchCompaniesCompanyIdRequestsRequestIdLinesLineId200,
      {
        companyId: string;
        requestId: string;
        lineId: string;
      } & PatchCompaniesCompanyIdRequestsRequestIdLinesLineIdBody
    >({
      query: ({ companyId, requestId, lineId, ...body }) => ({
        url: getPatchCompaniesCompanyIdRequestsRequestIdLinesLineIdUrl(companyId, requestId, lineId),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, requestId }) =>
        requestDetailTags(companyId, requestId),
    }),
    deleteRequestLine: builder.mutation<
      DeleteCompaniesCompanyIdRequestsRequestIdLinesLineId200,
      { companyId: string; requestId: string; lineId: string }
    >({
      query: ({ companyId, requestId, lineId }) => ({
        url: getDeleteCompaniesCompanyIdRequestsRequestIdLinesLineIdUrl(companyId, requestId, lineId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { companyId, requestId }) =>
        requestDetailTags(companyId, requestId),
    }),
    deleteRequest: builder.mutation<
      void,
      { companyId: string; requestId: string }
    >({
      query: ({ companyId, requestId }) => ({
        url: getDeleteCompaniesCompanyIdRequestsRequestIdUrl(companyId, requestId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { companyId }) =>
        requestListTag(companyId),
    }),
    listInboundRequests: builder.query<
      GetCompaniesCompanyIdRequestsInbound200,
      CompanyScopedArgs<GetCompaniesCompanyIdRequestsInboundParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: getGetCompaniesCompanyIdRequestsInboundUrl(companyId),
        params,
      }),
      providesTags: (_result, _error, { companyId }) => [
        { type: 'Requests', id: `${companyId}-inbound` },
      ],
    }),
    distributeRequest: builder.mutation<
      PostCompaniesCompanyIdRequestsRequestIdDistribute200,
      {
        companyId: string;
        requestId: string;
      } & PostCompaniesCompanyIdRequestsRequestIdDistributeBody
    >({
      query: ({ companyId, requestId, ...body }) => ({
        url: getPostCompaniesCompanyIdRequestsRequestIdDistributeUrl(companyId, requestId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, requestId }) => [
        ...requestDetailTags(companyId, requestId),
        ...inboundTags(companyId),
        { type: 'Requests', id: `${requestId}-distributions` },
      ],
    }),
    rejectInboundRequest: builder.mutation<
      PostCompaniesCompanyIdRequestsInboundRequestIdReject200,
      {
        companyId: string;
        requestId: string;
      } & PostCompaniesCompanyIdRequestsInboundRequestIdRejectBody
    >({
      query: ({ companyId, requestId, ...body }) => ({
        url: getPostCompaniesCompanyIdRequestsInboundRequestIdRejectUrl(companyId, requestId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, requestId }) => [
        ...inboundTags(companyId),
        { type: 'Requests', id: `${requestId}-inbound` },
      ],
    }),
    getRequestDistributions: builder.query<
      GetCompaniesCompanyIdRequestsRequestIdDistributions200,
      { companyId: string; requestId: string }
    >({
      query: ({ companyId, requestId }) => ({
        url: getGetCompaniesCompanyIdRequestsRequestIdDistributionsUrl(companyId, requestId),
      }),
      providesTags: (_result, _error, { requestId }) => [
        { type: 'Requests', id: `${requestId}-distributions` },
      ],
    }),
    getQuoteComparison: builder.query<
      GetCompaniesCompanyIdRequestsRequestIdQuotesComparison200,
      { companyId: string; requestId: string }
    >({
      query: ({ companyId, requestId }) => ({
        url: getGetCompaniesCompanyIdRequestsRequestIdQuotesComparisonUrl(companyId, requestId),
      }),
      providesTags: (_result, _error, { requestId }) => [
        { type: 'Requests', id: `${requestId}-comparison` },
      ],
    }),
    getRequestSelection: builder.query<
      GetCompaniesCompanyIdRequestsRequestIdSelection200,
      { companyId: string; requestId: string }
    >({
      query: ({ companyId, requestId }) => ({
        url: getGetCompaniesCompanyIdRequestsRequestIdSelectionUrl(companyId, requestId),
      }),
      providesTags: (_result, _error, { requestId }) => [
        { type: 'Selections', id: requestId },
      ],
    }),
    getBillableLines: builder.query<
      GetCompaniesCompanyIdRequestsRequestIdBillableLines200,
      { companyId: string; requestId: string }
    >({
      query: ({ companyId, requestId }) => ({
        url: getGetCompaniesCompanyIdRequestsRequestIdBillableLinesUrl(companyId, requestId),
      }),
      providesTags: (_result, _error, { requestId }) => [
        { type: 'Invoices', id: `billable-${requestId}` },
      ],
    }),
  }),
});

export const {
  useListRequestsQuery,
  useListRequestLinesQuery,
  useListInboundRequestLinesQuery,
  useGetRequestQuery,
  useGetInboundRequestQuery,
  useCreateRequestMutation,
  useUpdateRequestMutation,
  useAddRequestLineMutation,
  useUpdateRequestLineMutation,
  useDeleteRequestLineMutation,
  useDeleteRequestMutation,
  useListInboundRequestsQuery,
  useDistributeRequestMutation,
  useRejectInboundRequestMutation,
  useGetRequestDistributionsQuery,
  useGetQuoteComparisonQuery,
  useGetRequestSelectionQuery,
  useLazyGetRequestSelectionQuery,
  useGetBillableLinesQuery,
  useLazyGetBillableLinesQuery,
} = requestsApi;
