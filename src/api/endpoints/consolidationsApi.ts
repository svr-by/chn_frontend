import {
  getDeleteCompaniesCompanyIdConsolidationsConsolidationIdShippingInvoicesShippingInvoiceIdUrl,
  getGetCompaniesCompanyIdConsolidatableShippingInvoicesUrl,
  getGetCompaniesCompanyIdConsolidationsConsolidationIdUrl,
  getGetCompaniesCompanyIdConsolidationsUrl,
  getPatchCompaniesCompanyIdConsolidationsConsolidationIdUrl,
  getPostCompaniesCompanyIdConsolidationsConsolidationIdMarkCustomsUrl,
  getPostCompaniesCompanyIdConsolidationsConsolidationIdMarkDeliveredUrl,
  getPostCompaniesCompanyIdConsolidationsConsolidationIdMarkInTransitUrl,
  getPostCompaniesCompanyIdConsolidationsConsolidationIdPlanUrl,
  getPostCompaniesCompanyIdConsolidationsConsolidationIdShippingInvoicesUrl,
  getPostCompaniesCompanyIdConsolidationsUrl,
} from '@/api/generated/endpoints';
import type {
  DeleteCompaniesCompanyIdConsolidationsConsolidationIdShippingInvoicesShippingInvoiceId200,
  GetCompaniesCompanyIdConsolidatableShippingInvoices200,
  GetCompaniesCompanyIdConsolidations200,
  GetCompaniesCompanyIdConsolidationsConsolidationId200,
  GetCompaniesCompanyIdConsolidationsParams,
  PatchCompaniesCompanyIdConsolidationsConsolidationId200,
  PatchCompaniesCompanyIdConsolidationsConsolidationIdBody,
  PostCompaniesCompanyIdConsolidations201,
  PostCompaniesCompanyIdConsolidationsBody,
  PostCompaniesCompanyIdConsolidationsConsolidationIdMarkCustoms200,
  PostCompaniesCompanyIdConsolidationsConsolidationIdMarkDelivered200,
  PostCompaniesCompanyIdConsolidationsConsolidationIdMarkInTransit200,
  PostCompaniesCompanyIdConsolidationsConsolidationIdPlan200,
  PostCompaniesCompanyIdConsolidationsConsolidationIdShippingInvoices200,
  PostCompaniesCompanyIdConsolidationsConsolidationIdShippingInvoicesBody,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

type CompanyScopedArgs<T = void> = T extends void
  ? { companyId: string }
  : { companyId: string } & T;

function consolidationListTag(companyId: string) {
  return [{ type: 'Consolidations' as const, id: companyId }];
}

function consolidatableTag(companyId: string) {
  return [
    { type: 'ShippingInvoices' as const, id: `consolidatable-${companyId}` },
  ];
}

function consolidationDetailTags(
  companyId: string,
  consolidationId: string,
  shippingInvoiceId?: string,
) {
  const tags: Array<
    | { type: 'Consolidations'; id: string }
    | { type: 'ShippingInvoices'; id: string }
  > = [
    { type: 'Consolidations', id: companyId },
    { type: 'Consolidations', id: consolidationId },
    ...consolidatableTag(companyId),
  ];
  if (shippingInvoiceId) {
    tags.push({ type: 'ShippingInvoices', id: shippingInvoiceId });
  }
  return tags;
}

export const consolidationsApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listConsolidations: builder.query<
      GetCompaniesCompanyIdConsolidations200,
      CompanyScopedArgs<GetCompaniesCompanyIdConsolidationsParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: getGetCompaniesCompanyIdConsolidationsUrl(companyId),
        params,
      }),
      providesTags: (_result, _error, { companyId }) =>
        consolidationListTag(companyId),
    }),
    getConsolidation: builder.query<
      GetCompaniesCompanyIdConsolidationsConsolidationId200,
      { companyId: string; consolidationId: string }
    >({
      query: ({ companyId, consolidationId }) => ({
        url: getGetCompaniesCompanyIdConsolidationsConsolidationIdUrl(
          companyId,
          consolidationId,
        ),
      }),
      providesTags: (_result, _error, { consolidationId }) => [
        { type: 'Consolidations', id: consolidationId },
      ],
    }),
    getConsolidatableShippingInvoices: builder.query<
      GetCompaniesCompanyIdConsolidatableShippingInvoices200,
      { companyId: string }
    >({
      query: ({ companyId }) => ({
        url: getGetCompaniesCompanyIdConsolidatableShippingInvoicesUrl(
          companyId,
        ),
      }),
      providesTags: (_result, _error, { companyId }) =>
        consolidatableTag(companyId),
    }),
    createConsolidation: builder.mutation<
      PostCompaniesCompanyIdConsolidations201,
      CompanyScopedArgs<PostCompaniesCompanyIdConsolidationsBody>
    >({
      query: ({ companyId, ...body }) => ({
        url: getPostCompaniesCompanyIdConsolidationsUrl(companyId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId }) => [
        ...consolidationListTag(companyId),
        ...consolidatableTag(companyId),
      ],
    }),
    updateConsolidation: builder.mutation<
      PatchCompaniesCompanyIdConsolidationsConsolidationId200,
      {
        companyId: string;
        consolidationId: string;
      } & PatchCompaniesCompanyIdConsolidationsConsolidationIdBody
    >({
      query: ({ companyId, consolidationId, ...body }) => ({
        url: getPatchCompaniesCompanyIdConsolidationsConsolidationIdUrl(
          companyId,
          consolidationId,
        ),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, consolidationId }) =>
        consolidationDetailTags(companyId, consolidationId),
    }),
    addConsolidationShippingInvoice: builder.mutation<
      PostCompaniesCompanyIdConsolidationsConsolidationIdShippingInvoices200,
      {
        companyId: string;
        consolidationId: string;
        shippingInvoiceId?: string;
      } & PostCompaniesCompanyIdConsolidationsConsolidationIdShippingInvoicesBody
    >({
      query: ({
        companyId,
        consolidationId,
        shippingInvoiceId: _shippingInvoiceId,
        ...body
      }) => ({
        url: getPostCompaniesCompanyIdConsolidationsConsolidationIdShippingInvoicesUrl(
          companyId,
          consolidationId,
        ),
        method: 'POST',
        body,
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, consolidationId, shippingInvoiceId },
      ) =>
        consolidationDetailTags(companyId, consolidationId, shippingInvoiceId),
    }),
    removeConsolidationShippingInvoice: builder.mutation<
      DeleteCompaniesCompanyIdConsolidationsConsolidationIdShippingInvoicesShippingInvoiceId200,
      {
        companyId: string;
        consolidationId: string;
        shippingInvoiceId: string;
      }
    >({
      query: ({ companyId, consolidationId, shippingInvoiceId }) => ({
        url: getDeleteCompaniesCompanyIdConsolidationsConsolidationIdShippingInvoicesShippingInvoiceIdUrl(
          companyId,
          consolidationId,
          shippingInvoiceId,
        ),
        method: 'DELETE',
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, consolidationId, shippingInvoiceId },
      ) =>
        consolidationDetailTags(companyId, consolidationId, shippingInvoiceId),
    }),
    planConsolidation: builder.mutation<
      PostCompaniesCompanyIdConsolidationsConsolidationIdPlan200,
      { companyId: string; consolidationId: string }
    >({
      query: ({ companyId, consolidationId }) => ({
        url: getPostCompaniesCompanyIdConsolidationsConsolidationIdPlanUrl(
          companyId,
          consolidationId,
        ),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { companyId, consolidationId }) =>
        consolidationDetailTags(companyId, consolidationId),
    }),
    markConsolidationInTransit: builder.mutation<
      PostCompaniesCompanyIdConsolidationsConsolidationIdMarkInTransit200,
      { companyId: string; consolidationId: string }
    >({
      query: ({ companyId, consolidationId }) => ({
        url: getPostCompaniesCompanyIdConsolidationsConsolidationIdMarkInTransitUrl(
          companyId,
          consolidationId,
        ),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { companyId, consolidationId }) =>
        consolidationDetailTags(companyId, consolidationId),
    }),
    markConsolidationCustoms: builder.mutation<
      PostCompaniesCompanyIdConsolidationsConsolidationIdMarkCustoms200,
      { companyId: string; consolidationId: string }
    >({
      query: ({ companyId, consolidationId }) => ({
        url: getPostCompaniesCompanyIdConsolidationsConsolidationIdMarkCustomsUrl(
          companyId,
          consolidationId,
        ),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { companyId, consolidationId }) =>
        consolidationDetailTags(companyId, consolidationId),
    }),
    markConsolidationDelivered: builder.mutation<
      PostCompaniesCompanyIdConsolidationsConsolidationIdMarkDelivered200,
      { companyId: string; consolidationId: string }
    >({
      query: ({ companyId, consolidationId }) => ({
        url: getPostCompaniesCompanyIdConsolidationsConsolidationIdMarkDeliveredUrl(
          companyId,
          consolidationId,
        ),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { companyId, consolidationId }) =>
        consolidationDetailTags(companyId, consolidationId),
    }),
  }),
});

export const {
  useListConsolidationsQuery,
  useGetConsolidationQuery,
  useGetConsolidatableShippingInvoicesQuery,
  useLazyGetConsolidatableShippingInvoicesQuery,
  useCreateConsolidationMutation,
  useUpdateConsolidationMutation,
  useAddConsolidationShippingInvoiceMutation,
  useRemoveConsolidationShippingInvoiceMutation,
  usePlanConsolidationMutation,
  useMarkConsolidationInTransitMutation,
  useMarkConsolidationCustomsMutation,
  useMarkConsolidationDeliveredMutation,
} = consolidationsApi;
