import {
  getDeleteCompaniesCompanyIdSelectionsSelectionIdLinesLineIdUrl,
  getGetCompaniesCompanyIdSelectionsSelectionIdUrl,
  getGetCompaniesCompanyIdSelectionsUrl,
  getPatchCompaniesCompanyIdSelectionsSelectionIdLinesLineIdUrl,
  getPatchCompaniesCompanyIdSelectionsSelectionIdUrl,
  getPostCompaniesCompanyIdSelectionsSelectionIdCancelUrl,
  getPostCompaniesCompanyIdSelectionsSelectionIdConfirmUrl,
  getPostCompaniesCompanyIdSelectionsSelectionIdLinesUrl,
  getPostCompaniesCompanyIdSelectionsUrl,
} from '@/api/generated/endpoints';
import type {
  GetCompaniesCompanyIdSelections200,
  GetCompaniesCompanyIdSelectionsParams,
  GetCompaniesCompanyIdSelectionsSelectionId200,
  PatchCompaniesCompanyIdSelectionsSelectionId200,
  PatchCompaniesCompanyIdSelectionsSelectionIdBody,
  PatchCompaniesCompanyIdSelectionsSelectionIdLinesLineId200,
  PatchCompaniesCompanyIdSelectionsSelectionIdLinesLineIdBody,
  PostCompaniesCompanyIdSelections201,
  PostCompaniesCompanyIdSelectionsBody,
  PostCompaniesCompanyIdSelectionsSelectionIdCancel200,
  PostCompaniesCompanyIdSelectionsSelectionIdConfirm200,
  PostCompaniesCompanyIdSelectionsSelectionIdLines201,
  PostCompaniesCompanyIdSelectionsSelectionIdLinesBody,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

type CompanyScopedArgs<T = void> = T extends void
  ? { companyId: string }
  : { companyId: string } & T;

function selectionListTag(companyId: string) {
  return [{ type: 'Selections' as const, id: companyId }];
}

function selectionDetailTags(
  companyId: string,
  selectionId: string,
  materialRequestId?: string,
) {
  const tags: Array<
    { type: 'Selections'; id: string } | { type: 'Requests'; id: string }
  > = [
    { type: 'Selections', id: companyId },
    { type: 'Selections', id: selectionId },
  ];
  if (materialRequestId) {
    tags.push({ type: 'Selections', id: materialRequestId });
    tags.push({ type: 'Requests', id: materialRequestId });
  }
  return tags;
}

function selectionMutationTags(
  companyId: string,
  selectionId: string,
  materialRequestId?: string,
) {
  return [
    ...selectionDetailTags(companyId, selectionId, materialRequestId),
    { type: 'Quotes' as const, id: companyId },
  ];
}

export const selectionsApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listSelections: builder.query<
      GetCompaniesCompanyIdSelections200,
      CompanyScopedArgs<GetCompaniesCompanyIdSelectionsParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: getGetCompaniesCompanyIdSelectionsUrl(companyId),
        params,
      }),
      providesTags: (_result, _error, { companyId }) =>
        selectionListTag(companyId),
    }),
    getSelection: builder.query<
      GetCompaniesCompanyIdSelectionsSelectionId200,
      { companyId: string; selectionId: string }
    >({
      query: ({ companyId, selectionId }) => ({
        url: getGetCompaniesCompanyIdSelectionsSelectionIdUrl(
          companyId,
          selectionId,
        ),
      }),
      providesTags: (_result, _error, { selectionId }) => [
        { type: 'Selections', id: selectionId },
      ],
    }),
    createSelection: builder.mutation<
      PostCompaniesCompanyIdSelections201,
      CompanyScopedArgs<PostCompaniesCompanyIdSelectionsBody>
    >({
      query: ({ companyId, ...body }) => ({
        url: getPostCompaniesCompanyIdSelectionsUrl(companyId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, requestId }) => [
        ...selectionListTag(companyId),
        { type: 'Selections', id: requestId },
        { type: 'Requests', id: requestId },
      ],
    }),
    updateSelection: builder.mutation<
      PatchCompaniesCompanyIdSelectionsSelectionId200,
      {
        companyId: string;
        selectionId: string;
        materialRequestId?: string;
      } & PatchCompaniesCompanyIdSelectionsSelectionIdBody
    >({
      query: ({
        companyId,
        selectionId,
        materialRequestId: _requestId,
        ...body
      }) => ({
        url: getPatchCompaniesCompanyIdSelectionsSelectionIdUrl(
          companyId,
          selectionId,
        ),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, selectionId, materialRequestId },
      ) => selectionDetailTags(companyId, selectionId, materialRequestId),
    }),
    addSelectionLine: builder.mutation<
      PostCompaniesCompanyIdSelectionsSelectionIdLines201,
      {
        companyId: string;
        selectionId: string;
        materialRequestId?: string;
      } & PostCompaniesCompanyIdSelectionsSelectionIdLinesBody
    >({
      query: ({
        companyId,
        selectionId,
        materialRequestId: _requestId,
        ...body
      }) => ({
        url: getPostCompaniesCompanyIdSelectionsSelectionIdLinesUrl(
          companyId,
          selectionId,
        ),
        method: 'POST',
        body,
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, selectionId, materialRequestId },
      ) => selectionDetailTags(companyId, selectionId, materialRequestId),
    }),
    updateSelectionLine: builder.mutation<
      PatchCompaniesCompanyIdSelectionsSelectionIdLinesLineId200,
      {
        companyId: string;
        selectionId: string;
        lineId: string;
        materialRequestId?: string;
      } & PatchCompaniesCompanyIdSelectionsSelectionIdLinesLineIdBody
    >({
      query: ({
        companyId,
        selectionId,
        lineId,
        materialRequestId: _requestId,
        ...body
      }) => ({
        url: getPatchCompaniesCompanyIdSelectionsSelectionIdLinesLineIdUrl(
          companyId,
          selectionId,
          lineId,
        ),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, selectionId, materialRequestId },
      ) => selectionDetailTags(companyId, selectionId, materialRequestId),
    }),
    deleteSelectionLine: builder.mutation<
      void,
      {
        companyId: string;
        selectionId: string;
        lineId: string;
        materialRequestId?: string;
      }
    >({
      query: ({ companyId, selectionId, lineId }) => ({
        url: getDeleteCompaniesCompanyIdSelectionsSelectionIdLinesLineIdUrl(
          companyId,
          selectionId,
          lineId,
        ),
        method: 'DELETE',
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, selectionId, materialRequestId },
      ) => selectionDetailTags(companyId, selectionId, materialRequestId),
    }),
    confirmSelection: builder.mutation<
      PostCompaniesCompanyIdSelectionsSelectionIdConfirm200,
      {
        companyId: string;
        selectionId: string;
        materialRequestId?: string;
      }
    >({
      query: ({ companyId, selectionId }) => ({
        url: getPostCompaniesCompanyIdSelectionsSelectionIdConfirmUrl(
          companyId,
          selectionId,
        ),
        method: 'POST',
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, selectionId, materialRequestId },
      ) => selectionMutationTags(companyId, selectionId, materialRequestId),
    }),
    cancelSelection: builder.mutation<
      PostCompaniesCompanyIdSelectionsSelectionIdCancel200,
      {
        companyId: string;
        selectionId: string;
        materialRequestId?: string;
      }
    >({
      query: ({ companyId, selectionId }) => ({
        url: getPostCompaniesCompanyIdSelectionsSelectionIdCancelUrl(
          companyId,
          selectionId,
        ),
        method: 'POST',
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, selectionId, materialRequestId },
      ) => selectionMutationTags(companyId, selectionId, materialRequestId),
    }),
  }),
});

export const {
  useListSelectionsQuery,
  useGetSelectionQuery,
  useCreateSelectionMutation,
  useUpdateSelectionMutation,
  useAddSelectionLineMutation,
  useUpdateSelectionLineMutation,
  useDeleteSelectionLineMutation,
  useConfirmSelectionMutation,
  useCancelSelectionMutation,
} = selectionsApi;
