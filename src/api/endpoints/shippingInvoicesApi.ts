import {
  getDeleteCompaniesCompanyIdShippingInvoicesShippingInvoiceIdLinesLineIdUrl,
  getDeleteCompaniesCompanyIdShippingInvoicesShippingInvoiceIdUrl,
  getGetCompaniesCompanyIdShippingInvoicesShippingInvoiceIdUrl,
  getGetCompaniesCompanyIdShippingInvoicesUrl,
  getPatchCompaniesCompanyIdShippingInvoicesShippingInvoiceIdLinesLineIdUrl,
  getPatchCompaniesCompanyIdShippingInvoicesShippingInvoiceIdUrl,
  getPostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdIssueUrl,
  getPostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdLinesUrl,
  getPostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdMarkDeliveredUrl,
  getPostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdMarkInTransitUrl,
  getPostCompaniesCompanyIdShippingInvoicesUrl,
} from '@/api/generated/endpoints';
import type {
  GetCompaniesCompanyIdShippingInvoices200,
  GetCompaniesCompanyIdShippingInvoicesParams,
  GetCompaniesCompanyIdShippingInvoicesShippingInvoiceId200,
  PatchCompaniesCompanyIdShippingInvoicesShippingInvoiceId200,
  PatchCompaniesCompanyIdShippingInvoicesShippingInvoiceIdBody,
  PatchCompaniesCompanyIdShippingInvoicesShippingInvoiceIdLinesLineId200,
  PatchCompaniesCompanyIdShippingInvoicesShippingInvoiceIdLinesLineIdBody,
  PostCompaniesCompanyIdShippingInvoices201,
  PostCompaniesCompanyIdShippingInvoicesBody,
  PostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdIssue200,
  PostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdLines201,
  PostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdLinesBody,
  PostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdMarkDelivered200,
  PostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdMarkInTransit200,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

type CompanyScopedArgs<T = void> = T extends void
  ? { companyId: string }
  : { companyId: string } & T;

function shippingListTag(companyId: string) {
  return [{ type: 'ShippingInvoices' as const, id: companyId }];
}

function shippingDetailTags(
  companyId: string,
  shippingInvoiceId: string,
  supplierInvoiceId?: string,
) {
  const tags: Array<
    { type: 'ShippingInvoices'; id: string } | { type: 'Invoices'; id: string }
  > = [
    { type: 'ShippingInvoices', id: companyId },
    { type: 'ShippingInvoices', id: shippingInvoiceId },
  ];
  if (supplierInvoiceId) {
    tags.push({ type: 'Invoices', id: `shippable-${supplierInvoiceId}` });
  }
  return tags;
}

export const shippingInvoicesApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listShippingInvoices: builder.query<
      GetCompaniesCompanyIdShippingInvoices200,
      CompanyScopedArgs<GetCompaniesCompanyIdShippingInvoicesParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: getGetCompaniesCompanyIdShippingInvoicesUrl(companyId),
        params,
      }),
      providesTags: (_result, _error, { companyId }) =>
        shippingListTag(companyId),
    }),
    getShippingInvoice: builder.query<
      GetCompaniesCompanyIdShippingInvoicesShippingInvoiceId200,
      { companyId: string; shippingInvoiceId: string }
    >({
      query: ({ companyId, shippingInvoiceId }) => ({
        url: getGetCompaniesCompanyIdShippingInvoicesShippingInvoiceIdUrl(
          companyId,
          shippingInvoiceId,
        ),
      }),
      providesTags: (_result, _error, { shippingInvoiceId }) => [
        { type: 'ShippingInvoices', id: shippingInvoiceId },
      ],
    }),
    createShippingInvoice: builder.mutation<
      PostCompaniesCompanyIdShippingInvoices201,
      CompanyScopedArgs<PostCompaniesCompanyIdShippingInvoicesBody>
    >({
      query: ({ companyId, ...body }) => ({
        url: getPostCompaniesCompanyIdShippingInvoicesUrl(companyId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, supplierInvoiceId }) => [
        ...shippingListTag(companyId),
        { type: 'Invoices', id: `shippable-${supplierInvoiceId}` },
      ],
    }),
    updateShippingInvoice: builder.mutation<
      PatchCompaniesCompanyIdShippingInvoicesShippingInvoiceId200,
      {
        companyId: string;
        shippingInvoiceId: string;
        supplierInvoiceId?: string;
      } & PatchCompaniesCompanyIdShippingInvoicesShippingInvoiceIdBody
    >({
      query: ({
        companyId,
        shippingInvoiceId,
        supplierInvoiceId: _supplierInvoiceId,
        ...body
      }) => ({
        url: getPatchCompaniesCompanyIdShippingInvoicesShippingInvoiceIdUrl(
          companyId,
          shippingInvoiceId,
        ),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, shippingInvoiceId, supplierInvoiceId },
      ) => shippingDetailTags(companyId, shippingInvoiceId, supplierInvoiceId),
    }),
    addShippingLine: builder.mutation<
      PostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdLines201,
      {
        companyId: string;
        shippingInvoiceId: string;
        supplierInvoiceId?: string;
      } & PostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdLinesBody
    >({
      query: ({
        companyId,
        shippingInvoiceId,
        supplierInvoiceId: _supplierInvoiceId,
        ...body
      }) => ({
        url: getPostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdLinesUrl(
          companyId,
          shippingInvoiceId,
        ),
        method: 'POST',
        body,
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, shippingInvoiceId, supplierInvoiceId },
      ) => shippingDetailTags(companyId, shippingInvoiceId, supplierInvoiceId),
    }),
    updateShippingLine: builder.mutation<
      PatchCompaniesCompanyIdShippingInvoicesShippingInvoiceIdLinesLineId200,
      {
        companyId: string;
        shippingInvoiceId: string;
        lineId: string;
        supplierInvoiceId?: string;
      } & PatchCompaniesCompanyIdShippingInvoicesShippingInvoiceIdLinesLineIdBody
    >({
      query: ({
        companyId,
        shippingInvoiceId,
        lineId,
        supplierInvoiceId: _supplierInvoiceId,
        ...body
      }) => ({
        url: getPatchCompaniesCompanyIdShippingInvoicesShippingInvoiceIdLinesLineIdUrl(
          companyId,
          shippingInvoiceId,
          lineId,
        ),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, shippingInvoiceId, supplierInvoiceId },
      ) => shippingDetailTags(companyId, shippingInvoiceId, supplierInvoiceId),
    }),
    deleteShippingLine: builder.mutation<
      void,
      {
        companyId: string;
        shippingInvoiceId: string;
        lineId: string;
        supplierInvoiceId?: string;
      }
    >({
      query: ({ companyId, shippingInvoiceId, lineId }) => ({
        url: getDeleteCompaniesCompanyIdShippingInvoicesShippingInvoiceIdLinesLineIdUrl(
          companyId,
          shippingInvoiceId,
          lineId,
        ),
        method: 'DELETE',
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, shippingInvoiceId, supplierInvoiceId },
      ) => shippingDetailTags(companyId, shippingInvoiceId, supplierInvoiceId),
    }),
    deleteShippingInvoice: builder.mutation<
      void,
      {
        companyId: string;
        shippingInvoiceId: string;
        supplierInvoiceId?: string;
      }
    >({
      query: ({ companyId, shippingInvoiceId }) => ({
        url: getDeleteCompaniesCompanyIdShippingInvoicesShippingInvoiceIdUrl(
          companyId,
          shippingInvoiceId,
        ),
        method: 'DELETE',
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, shippingInvoiceId, supplierInvoiceId },
      ) => shippingDetailTags(companyId, shippingInvoiceId, supplierInvoiceId),
    }),
    issueShippingInvoice: builder.mutation<
      PostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdIssue200,
      {
        companyId: string;
        shippingInvoiceId: string;
        supplierInvoiceId?: string;
      }
    >({
      query: ({ companyId, shippingInvoiceId }) => ({
        url: getPostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdIssueUrl(
          companyId,
          shippingInvoiceId,
        ),
        method: 'POST',
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, shippingInvoiceId, supplierInvoiceId },
      ) => shippingDetailTags(companyId, shippingInvoiceId, supplierInvoiceId),
    }),
    markShippingInTransit: builder.mutation<
      PostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdMarkInTransit200,
      {
        companyId: string;
        shippingInvoiceId: string;
        supplierInvoiceId?: string;
      }
    >({
      query: ({ companyId, shippingInvoiceId }) => ({
        url: getPostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdMarkInTransitUrl(
          companyId,
          shippingInvoiceId,
        ),
        method: 'POST',
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, shippingInvoiceId, supplierInvoiceId },
      ) => shippingDetailTags(companyId, shippingInvoiceId, supplierInvoiceId),
    }),
    markShippingDelivered: builder.mutation<
      PostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdMarkDelivered200,
      {
        companyId: string;
        shippingInvoiceId: string;
        supplierInvoiceId?: string;
      }
    >({
      query: ({ companyId, shippingInvoiceId }) => ({
        url: getPostCompaniesCompanyIdShippingInvoicesShippingInvoiceIdMarkDeliveredUrl(
          companyId,
          shippingInvoiceId,
        ),
        method: 'POST',
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, shippingInvoiceId, supplierInvoiceId },
      ) => shippingDetailTags(companyId, shippingInvoiceId, supplierInvoiceId),
    }),
  }),
});

export const {
  useListShippingInvoicesQuery,
  useGetShippingInvoiceQuery,
  useCreateShippingInvoiceMutation,
  useUpdateShippingInvoiceMutation,
  useAddShippingLineMutation,
  useUpdateShippingLineMutation,
  useDeleteShippingLineMutation,
  useDeleteShippingInvoiceMutation,
  useIssueShippingInvoiceMutation,
  useMarkShippingInTransitMutation,
  useMarkShippingDeliveredMutation,
} = shippingInvoicesApi;
