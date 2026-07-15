import type {
  DeleteCompaniesCompanyIdRequestsRequestIdLinesLineId200,
  GetCompaniesCompanyIdRequestLines200,
  GetCompaniesCompanyIdRequestLinesParams,
  GetCompaniesCompanyIdRequests200,
  GetCompaniesCompanyIdRequestsInbound200,
  GetCompaniesCompanyIdRequestsInboundParams,
  GetCompaniesCompanyIdRequestsParams,
  GetCompaniesCompanyIdRequestsRequestId200,
  GetCompaniesCompanyIdRequestsRequestIdBillableLines200,
  GetCompaniesCompanyIdRequestsRequestIdQuotesComparison200,
  GetCompaniesCompanyIdRequestsRequestIdSelection200,
  PatchCompaniesCompanyIdRequestsRequestId200,
  PatchCompaniesCompanyIdRequestsRequestIdBody,
  PatchCompaniesCompanyIdRequestsRequestIdLinesLineId200,
  PatchCompaniesCompanyIdRequestsRequestIdLinesLineIdBody,
  PostCompaniesCompanyIdRequests201,
  PostCompaniesCompanyIdRequestsBody,
  PostCompaniesCompanyIdRequestsRequestIdDistribute200,
  PostCompaniesCompanyIdRequestsRequestIdDistributeBody,
  PostCompaniesCompanyIdRequestsRequestIdLines201,
  PostCompaniesCompanyIdRequestsRequestIdLinesBody,
  PostCompaniesCompanyIdRequestsRequestIdSubmit200,
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

export const requestsApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listRequests: builder.query<
      GetCompaniesCompanyIdRequests200,
      CompanyScopedArgs<GetCompaniesCompanyIdRequestsParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: `/companies/${companyId}/requests`,
        params,
      }),
      providesTags: (_result, _error, { companyId }) => requestListTag(companyId),
    }),
    listRequestLines: builder.query<
      GetCompaniesCompanyIdRequestLines200,
      CompanyScopedArgs<GetCompaniesCompanyIdRequestLinesParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: `/companies/${companyId}/request-lines`,
        params,
      }),
      providesTags: (_result, _error, { companyId }) => requestListTag(companyId),
    }),
    getRequest: builder.query<
      GetCompaniesCompanyIdRequestsRequestId200,
      { companyId: string; requestId: string }
    >({
      query: ({ companyId, requestId }) => ({
        url: `/companies/${companyId}/requests/${requestId}`,
      }),
      providesTags: (_result, _error, { requestId }) => [
        { type: 'Requests', id: requestId },
      ],
    }),
    createRequest: builder.mutation<
      PostCompaniesCompanyIdRequests201,
      CompanyScopedArgs<PostCompaniesCompanyIdRequestsBody>
    >({
      query: ({ companyId, ...body }) => ({
        url: `/companies/${companyId}/requests`,
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
        url: `/companies/${companyId}/requests/${requestId}`,
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
        url: `/companies/${companyId}/requests/${requestId}/lines`,
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
        url: `/companies/${companyId}/requests/${requestId}/lines/${lineId}`,
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
        url: `/companies/${companyId}/requests/${requestId}/lines/${lineId}`,
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
        url: `/companies/${companyId}/requests/${requestId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { companyId }) =>
        requestListTag(companyId),
    }),
    submitRequest: builder.mutation<
      PostCompaniesCompanyIdRequestsRequestIdSubmit200,
      { companyId: string; requestId: string }
    >({
      query: ({ companyId, requestId }) => ({
        url: `/companies/${companyId}/requests/${requestId}/submit`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { companyId, requestId }) =>
        requestDetailTags(companyId, requestId),
    }),
    listInboundRequests: builder.query<
      GetCompaniesCompanyIdRequestsInbound200,
      CompanyScopedArgs<GetCompaniesCompanyIdRequestsInboundParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: `/companies/${companyId}/requests/inbound`,
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
        url: `/companies/${companyId}/requests/${requestId}/distribute`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, requestId }) =>
        requestDetailTags(companyId, requestId),
    }),
    getQuoteComparison: builder.query<
      GetCompaniesCompanyIdRequestsRequestIdQuotesComparison200,
      { companyId: string; requestId: string }
    >({
      query: ({ companyId, requestId }) => ({
        url: `/companies/${companyId}/requests/${requestId}/quotes/comparison`,
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
        url: `/companies/${companyId}/requests/${requestId}/selection`,
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
        url: `/companies/${companyId}/requests/${requestId}/billable-lines`,
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
  useGetRequestQuery,
  useCreateRequestMutation,
  useUpdateRequestMutation,
  useAddRequestLineMutation,
  useUpdateRequestLineMutation,
  useDeleteRequestLineMutation,
  useDeleteRequestMutation,
  useSubmitRequestMutation,
  useListInboundRequestsQuery,
  useDistributeRequestMutation,
  useGetQuoteComparisonQuery,
  useGetRequestSelectionQuery,
  useLazyGetRequestSelectionQuery,
  useGetBillableLinesQuery,
  useLazyGetBillableLinesQuery,
} = requestsApi;
