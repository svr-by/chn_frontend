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
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

type CompanyScopedArgs<T = void> = T extends void
  ? { companyId: string }
  : { companyId: string } & T;

function invoiceListTag(companyId: string) {
  return [{ type: 'Invoices' as const, id: companyId }];
}

function invoiceDetailTags(
  companyId: string,
  invoiceId: string,
  materialRequestId?: string,
  quoteId?: string,
) {
  const tags: Array<
    { type: 'Invoices'; id: string } | { type: 'Requests'; id: string } | { type: 'Quotes'; id: string }
  > = [
    { type: 'Invoices', id: companyId },
    { type: 'Invoices', id: invoiceId },
  ];
  if (materialRequestId) {
    tags.push({ type: 'Requests', id: materialRequestId });
  }
  if (quoteId) {
    tags.push({ type: 'Quotes', id: `billable-${quoteId}` });
  }
  return tags;
}

function invoiceMutationTags(
  companyId: string,
  invoiceId: string,
  materialRequestId?: string,
  quoteId?: string,
) {
  return invoiceDetailTags(companyId, invoiceId, materialRequestId, quoteId);
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
      CompanyScopedArgs<PostCompaniesCompanyIdInvoicesBody> & {
        quoteId?: string;
      }
    >({
      query: ({ companyId, quoteId: _quoteId, ...body }) => ({
        url: getPostCompaniesCompanyIdInvoicesUrl(companyId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, materialRequestId, quoteId },
      ) => [
        ...invoiceListTag(companyId),
        { type: 'Requests', id: materialRequestId },
        ...(quoteId ? [{ type: 'Quotes' as const, id: `billable-${quoteId}` }] : []),
      ],
    }),
    updateInvoice: builder.mutation<
      PatchCompaniesCompanyIdInvoicesInvoiceId200,
      {
        companyId: string;
        invoiceId: string;
        materialRequestId?: string;
        quoteId?: string;
      } & PatchCompaniesCompanyIdInvoicesInvoiceIdBody
    >({
      query: ({
        companyId,
        invoiceId,
        materialRequestId: _requestId,
        quoteId: _quoteId,
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
        { companyId, invoiceId, materialRequestId, quoteId },
      ) =>
        invoiceDetailTags(companyId, invoiceId, materialRequestId, quoteId),
    }),
    addInvoiceLine: builder.mutation<
      PostCompaniesCompanyIdInvoicesInvoiceIdLines201,
      {
        companyId: string;
        invoiceId: string;
        materialRequestId?: string;
        quoteId?: string;
      } & PostCompaniesCompanyIdInvoicesInvoiceIdLinesBody
    >({
      query: ({
        companyId,
        invoiceId,
        materialRequestId: _requestId,
        quoteId: _quoteId,
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
        { companyId, invoiceId, materialRequestId, quoteId },
      ) =>
        invoiceDetailTags(companyId, invoiceId, materialRequestId, quoteId),
    }),
    updateInvoiceLine: builder.mutation<
      PatchCompaniesCompanyIdInvoicesInvoiceIdLinesLineId200,
      {
        companyId: string;
        invoiceId: string;
        lineId: string;
        materialRequestId?: string;
        quoteId?: string;
      } & PatchCompaniesCompanyIdInvoicesInvoiceIdLinesLineIdBody
    >({
      query: ({
        companyId,
        invoiceId,
        lineId,
        materialRequestId: _requestId,
        quoteId: _quoteId,
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
        { companyId, invoiceId, materialRequestId, quoteId },
      ) =>
        invoiceDetailTags(companyId, invoiceId, materialRequestId, quoteId),
    }),
    deleteInvoiceLine: builder.mutation<
      void,
      {
        companyId: string;
        invoiceId: string;
        lineId: string;
        materialRequestId?: string;
        quoteId?: string;
      }
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
        { companyId, invoiceId, materialRequestId, quoteId },
      ) =>
        invoiceDetailTags(companyId, invoiceId, materialRequestId, quoteId),
    }),
    issueInvoice: builder.mutation<
      PostCompaniesCompanyIdInvoicesInvoiceIdIssue200,
      {
        companyId: string;
        invoiceId: string;
        materialRequestId?: string;
        quoteId?: string;
      }
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
        { companyId, invoiceId, materialRequestId, quoteId },
      ) =>
        invoiceMutationTags(
          companyId,
          invoiceId,
          materialRequestId,
          quoteId,
        ),
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
        materialRequestId?: string;
        quoteId?: string;
      }
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
        { companyId, invoiceId, materialRequestId, quoteId },
      ) =>
        invoiceMutationTags(
          companyId,
          invoiceId,
          materialRequestId,
          quoteId,
        ),
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
