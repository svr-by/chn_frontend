import {
  getDeleteCompaniesCompanyIdInvoicesInvoiceIdLinesLineIdUrl,
  getGetCompaniesCompanyIdInvoicesInvoiceIdShippableLinesUrl,
  getGetCompaniesCompanyIdInvoicesInvoiceIdUrl,
  getGetCompaniesCompanyIdInvoicesUrl,
  getPatchCompaniesCompanyIdInvoicesInvoiceIdLinesLineIdUrl,
  getPatchCompaniesCompanyIdInvoicesInvoiceIdUrl,
  getPostCompaniesCompanyIdInvoicesInvoiceIdConfirmUrl,
  getPostCompaniesCompanyIdInvoicesInvoiceIdIssueUrl,
  getPostCompaniesCompanyIdInvoicesInvoiceIdLinesUrl,
  getPostCompaniesCompanyIdInvoicesUrl,
} from '@/api/generated/endpoints';
import type {
  GetCompaniesCompanyIdInvoices200,
  GetCompaniesCompanyIdInvoicesInvoiceId200,
  GetCompaniesCompanyIdInvoicesInvoiceIdShippableLines200,
  GetCompaniesCompanyIdInvoicesParams,
  PatchCompaniesCompanyIdInvoicesInvoiceId200,
  PatchCompaniesCompanyIdInvoicesInvoiceIdBody,
  PatchCompaniesCompanyIdInvoicesInvoiceIdLinesLineId200,
  PatchCompaniesCompanyIdInvoicesInvoiceIdLinesLineIdBody,
  PostCompaniesCompanyIdInvoices201,
  PostCompaniesCompanyIdInvoicesBody,
  PostCompaniesCompanyIdInvoicesInvoiceIdConfirm200,
  PostCompaniesCompanyIdInvoicesInvoiceIdIssue200,
  PostCompaniesCompanyIdInvoicesInvoiceIdLines201,
  PostCompaniesCompanyIdInvoicesInvoiceIdLinesBody,
  SupplierInvoice,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

type CompanyScopedArgs<T = void> = T extends void
  ? { companyId: string }
  : { companyId: string } & T;

type InvoiceCacheMeta = {
  requestIds?: string[];
  quoteIds?: string[];
};

function invoiceListTag(companyId: string) {
  return [{ type: 'Invoices' as const, id: companyId }];
}

function requestAndQuoteTags(meta?: InvoiceCacheMeta) {
  const tags: Array<
    { type: 'Requests'; id: string } | { type: 'Quotes'; id: string }
  > = [];
  for (const requestId of meta?.requestIds ?? []) {
    tags.push({ type: 'Requests', id: requestId });
  }
  for (const quoteId of meta?.quoteIds ?? []) {
    tags.push({ type: 'Quotes', id: `billable-${quoteId}` });
  }
  return tags;
}

function requestIdsFromInvoice(invoice: SupplierInvoice | undefined): string[] {
  if (!invoice) {
    return [];
  }
  return [
    ...new Set(
      invoice.lines
        .map((line) => line.requestLine?.requestId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
}

function invoiceDetailTags(
  companyId: string,
  invoiceId: string,
  meta?: InvoiceCacheMeta,
) {
  return [
    { type: 'Invoices' as const, id: companyId },
    { type: 'Invoices' as const, id: invoiceId },
    ...requestAndQuoteTags(meta),
  ];
}

export const invoicesApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listInvoices: builder.query<
      GetCompaniesCompanyIdInvoices200,
      CompanyScopedArgs<GetCompaniesCompanyIdInvoicesParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: getGetCompaniesCompanyIdInvoicesUrl(companyId),
        params,
      }),
      providesTags: (_result, _error, { companyId }) =>
        invoiceListTag(companyId),
    }),
    getInvoice: builder.query<
      GetCompaniesCompanyIdInvoicesInvoiceId200,
      { companyId: string; invoiceId: string }
    >({
      query: ({ companyId, invoiceId }) => ({
        url: getGetCompaniesCompanyIdInvoicesInvoiceIdUrl(companyId, invoiceId),
      }),
      providesTags: (_result, _error, { invoiceId }) => [
        { type: 'Invoices', id: invoiceId },
      ],
    }),
    createInvoice: builder.mutation<
      PostCompaniesCompanyIdInvoices201,
      CompanyScopedArgs<PostCompaniesCompanyIdInvoicesBody> & InvoiceCacheMeta
    >({
      query: ({ companyId, quoteIds: _quoteIds, requestIds: _requestIds, ...body }) => ({
        url: getPostCompaniesCompanyIdInvoicesUrl(companyId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, _error, { companyId, quoteIds, requestIds }) => [
        ...invoiceListTag(companyId),
        ...(result?.invoice
          ? [{ type: 'Invoices' as const, id: result.invoice.id }]
          : []),
        ...requestAndQuoteTags({
          quoteIds,
          requestIds: requestIds ?? requestIdsFromInvoice(result?.invoice),
        }),
      ],
    }),
    updateInvoice: builder.mutation<
      PatchCompaniesCompanyIdInvoicesInvoiceId200,
      {
        companyId: string;
        invoiceId: string;
      } & InvoiceCacheMeta &
        PatchCompaniesCompanyIdInvoicesInvoiceIdBody
    >({
      query: ({
        companyId,
        invoiceId,
        requestIds: _requestIds,
        quoteIds: _quoteIds,
        ...body
      }) => ({
        url: getPatchCompaniesCompanyIdInvoicesInvoiceIdUrl(
          companyId,
          invoiceId,
        ),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, invoiceId, requestIds, quoteIds },
      ) => invoiceDetailTags(companyId, invoiceId, { requestIds, quoteIds }),
    }),
    addInvoiceLine: builder.mutation<
      PostCompaniesCompanyIdInvoicesInvoiceIdLines201,
      {
        companyId: string;
        invoiceId: string;
      } & InvoiceCacheMeta &
        PostCompaniesCompanyIdInvoicesInvoiceIdLinesBody
    >({
      query: ({
        companyId,
        invoiceId,
        requestIds: _requestIds,
        quoteIds: _quoteIds,
        ...body
      }) => ({
        url: getPostCompaniesCompanyIdInvoicesInvoiceIdLinesUrl(
          companyId,
          invoiceId,
        ),
        method: 'POST',
        body,
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, invoiceId, requestIds, quoteIds },
      ) => invoiceDetailTags(companyId, invoiceId, { requestIds, quoteIds }),
    }),
    updateInvoiceLine: builder.mutation<
      PatchCompaniesCompanyIdInvoicesInvoiceIdLinesLineId200,
      {
        companyId: string;
        invoiceId: string;
        lineId: string;
      } & InvoiceCacheMeta &
        PatchCompaniesCompanyIdInvoicesInvoiceIdLinesLineIdBody
    >({
      query: ({
        companyId,
        invoiceId,
        lineId,
        requestIds: _requestIds,
        quoteIds: _quoteIds,
        ...body
      }) => ({
        url: getPatchCompaniesCompanyIdInvoicesInvoiceIdLinesLineIdUrl(
          companyId,
          invoiceId,
          lineId,
        ),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, invoiceId, requestIds, quoteIds },
      ) => invoiceDetailTags(companyId, invoiceId, { requestIds, quoteIds }),
    }),
    deleteInvoiceLine: builder.mutation<
      void,
      {
        companyId: string;
        invoiceId: string;
        lineId: string;
      } & InvoiceCacheMeta
    >({
      query: ({ companyId, invoiceId, lineId }) => ({
        url: getDeleteCompaniesCompanyIdInvoicesInvoiceIdLinesLineIdUrl(
          companyId,
          invoiceId,
          lineId,
        ),
        method: 'DELETE',
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, invoiceId, requestIds, quoteIds },
      ) => invoiceDetailTags(companyId, invoiceId, { requestIds, quoteIds }),
    }),
    issueInvoice: builder.mutation<
      PostCompaniesCompanyIdInvoicesInvoiceIdIssue200,
      {
        companyId: string;
        invoiceId: string;
      } & InvoiceCacheMeta
    >({
      query: ({ companyId, invoiceId }) => ({
        url: getPostCompaniesCompanyIdInvoicesInvoiceIdIssueUrl(
          companyId,
          invoiceId,
        ),
        method: 'POST',
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, invoiceId, requestIds, quoteIds },
      ) => invoiceDetailTags(companyId, invoiceId, { requestIds, quoteIds }),
    }),
    getShippableLines: builder.query<
      GetCompaniesCompanyIdInvoicesInvoiceIdShippableLines200,
      { companyId: string; invoiceId: string }
    >({
      query: ({ companyId, invoiceId }) => ({
        url: getGetCompaniesCompanyIdInvoicesInvoiceIdShippableLinesUrl(
          companyId,
          invoiceId,
        ),
      }),
      providesTags: (_result, _error, { invoiceId }) => [
        { type: 'Invoices', id: `shippable-${invoiceId}` },
      ],
    }),
    confirmInvoice: builder.mutation<
      PostCompaniesCompanyIdInvoicesInvoiceIdConfirm200,
      {
        companyId: string;
        invoiceId: string;
      } & InvoiceCacheMeta
    >({
      query: ({ companyId, invoiceId }) => ({
        url: getPostCompaniesCompanyIdInvoicesInvoiceIdConfirmUrl(
          companyId,
          invoiceId,
        ),
        method: 'POST',
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, invoiceId, requestIds, quoteIds },
      ) => invoiceDetailTags(companyId, invoiceId, { requestIds, quoteIds }),
    }),
  }),
});

export const {
  useListInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useAddInvoiceLineMutation,
  useUpdateInvoiceLineMutation,
  useDeleteInvoiceLineMutation,
  useIssueInvoiceMutation,
  useConfirmInvoiceMutation,
  useGetShippableLinesQuery,
  useLazyGetShippableLinesQuery,
} = invoicesApi;
