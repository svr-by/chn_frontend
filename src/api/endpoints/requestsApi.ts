import type {
  DeleteCompaniesCompanyIdRequestsRequestIdLinesLineId200,
  GetCompaniesCompanyIdRequests200,
  GetCompaniesCompanyIdRequestsParams,
  GetCompaniesCompanyIdRequestsRequestId200,
  PatchCompaniesCompanyIdRequestsRequestId200,
  PatchCompaniesCompanyIdRequestsRequestIdBody,
  PatchCompaniesCompanyIdRequestsRequestIdLinesLineId200,
  PatchCompaniesCompanyIdRequestsRequestIdLinesLineIdBody,
  PostCompaniesCompanyIdRequests201,
  PostCompaniesCompanyIdRequestsBody,
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
  }),
});

export const {
  useListRequestsQuery,
  useGetRequestQuery,
  useCreateRequestMutation,
  useUpdateRequestMutation,
  useAddRequestLineMutation,
  useUpdateRequestLineMutation,
  useDeleteRequestLineMutation,
  useSubmitRequestMutation,
} = requestsApi;
