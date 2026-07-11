import type {
  GetCompaniesCompanyIdInvoices200,
  GetCompaniesCompanyIdInvoicesInvoiceId200,
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
  purchaseSelectionId?: string,
) {
  const tags: Array<
    | { type: 'Invoices'; id: string }
    | { type: 'Requests'; id: string }
    | { type: 'Selections'; id: string }
  > = [
    { type: 'Invoices', id: companyId },
    { type: 'Invoices', id: invoiceId },
  ];
  if (materialRequestId) {
    tags.push({ type: 'Requests', id: materialRequestId });
    tags.push({ type: 'Invoices', id: `billable-${materialRequestId}` });
  }
  if (purchaseSelectionId) {
    tags.push({ type: 'Selections', id: purchaseSelectionId });
  }
  return tags;
}

function invoiceMutationTags(
  companyId: string,
  invoiceId: string,
  materialRequestId?: string,
  purchaseSelectionId?: string,
) {
  return invoiceDetailTags(
    companyId,
    invoiceId,
    materialRequestId,
    purchaseSelectionId,
  );
}

export const invoicesApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listInvoices: builder.query<
      GetCompaniesCompanyIdInvoices200,
      CompanyScopedArgs<GetCompaniesCompanyIdInvoicesParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: `/companies/${companyId}/invoices`,
        params,
      }),
      providesTags: (_result, _error, { companyId }) => invoiceListTag(companyId),
    }),
    getInvoice: builder.query<
      GetCompaniesCompanyIdInvoicesInvoiceId200,
      { companyId: string; invoiceId: string }
    >({
      query: ({ companyId, invoiceId }) => ({
        url: `/companies/${companyId}/invoices/${invoiceId}`,
      }),
      providesTags: (_result, _error, { invoiceId }) => [
        { type: 'Invoices', id: invoiceId },
      ],
    }),
    createInvoice: builder.mutation<
      PostCompaniesCompanyIdInvoices201,
      CompanyScopedArgs<PostCompaniesCompanyIdInvoicesBody>
    >({
      query: ({ companyId, ...body }) => ({
        url: `/companies/${companyId}/invoices`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, materialRequestId }) => [
        ...invoiceListTag(companyId),
        { type: 'Requests', id: materialRequestId },
        { type: 'Invoices', id: `billable-${materialRequestId}` },
      ],
    }),
    updateInvoice: builder.mutation<
      PatchCompaniesCompanyIdInvoicesInvoiceId200,
      {
        companyId: string;
        invoiceId: string;
        materialRequestId?: string;
        purchaseSelectionId?: string;
      } & PatchCompaniesCompanyIdInvoicesInvoiceIdBody
    >({
      query: ({
        companyId,
        invoiceId,
        materialRequestId: _requestId,
        purchaseSelectionId: _selectionId,
        ...body
      }) => ({
        url: `/companies/${companyId}/invoices/${invoiceId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, invoiceId, materialRequestId, purchaseSelectionId },
      ) =>
        invoiceDetailTags(
          companyId,
          invoiceId,
          materialRequestId,
          purchaseSelectionId,
        ),
    }),
    addInvoiceLine: builder.mutation<
      PostCompaniesCompanyIdInvoicesInvoiceIdLines201,
      {
        companyId: string;
        invoiceId: string;
        materialRequestId?: string;
        purchaseSelectionId?: string;
      } & PostCompaniesCompanyIdInvoicesInvoiceIdLinesBody
    >({
      query: ({
        companyId,
        invoiceId,
        materialRequestId: _requestId,
        purchaseSelectionId: _selectionId,
        ...body
      }) => ({
        url: `/companies/${companyId}/invoices/${invoiceId}/lines`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, invoiceId, materialRequestId, purchaseSelectionId },
      ) =>
        invoiceDetailTags(
          companyId,
          invoiceId,
          materialRequestId,
          purchaseSelectionId,
        ),
    }),
    updateInvoiceLine: builder.mutation<
      PatchCompaniesCompanyIdInvoicesInvoiceIdLinesLineId200,
      {
        companyId: string;
        invoiceId: string;
        lineId: string;
        materialRequestId?: string;
        purchaseSelectionId?: string;
      } & PatchCompaniesCompanyIdInvoicesInvoiceIdLinesLineIdBody
    >({
      query: ({
        companyId,
        invoiceId,
        lineId,
        materialRequestId: _requestId,
        purchaseSelectionId: _selectionId,
        ...body
      }) => ({
        url: `/companies/${companyId}/invoices/${invoiceId}/lines/${lineId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, invoiceId, materialRequestId, purchaseSelectionId },
      ) =>
        invoiceDetailTags(
          companyId,
          invoiceId,
          materialRequestId,
          purchaseSelectionId,
        ),
    }),
    deleteInvoiceLine: builder.mutation<
      void,
      {
        companyId: string;
        invoiceId: string;
        lineId: string;
        materialRequestId?: string;
        purchaseSelectionId?: string;
      }
    >({
      query: ({ companyId, invoiceId, lineId }) => ({
        url: `/companies/${companyId}/invoices/${invoiceId}/lines/${lineId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, invoiceId, materialRequestId, purchaseSelectionId },
      ) =>
        invoiceDetailTags(
          companyId,
          invoiceId,
          materialRequestId,
          purchaseSelectionId,
        ),
    }),
    issueInvoice: builder.mutation<
      PostCompaniesCompanyIdInvoicesInvoiceIdIssue200,
      {
        companyId: string;
        invoiceId: string;
        materialRequestId?: string;
        purchaseSelectionId?: string;
      }
    >({
      query: ({ companyId, invoiceId }) => ({
        url: `/companies/${companyId}/invoices/${invoiceId}/issue`,
        method: 'POST',
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, invoiceId, materialRequestId, purchaseSelectionId },
      ) =>
        invoiceMutationTags(
          companyId,
          invoiceId,
          materialRequestId,
          purchaseSelectionId,
        ),
    }),
    confirmInvoice: builder.mutation<
      PostCompaniesCompanyIdInvoicesInvoiceIdConfirm200,
      {
        companyId: string;
        invoiceId: string;
        materialRequestId?: string;
        purchaseSelectionId?: string;
      }
    >({
      query: ({ companyId, invoiceId }) => ({
        url: `/companies/${companyId}/invoices/${invoiceId}/confirm`,
        method: 'POST',
      }),
      invalidatesTags: (
        _result,
        _error,
        { companyId, invoiceId, materialRequestId, purchaseSelectionId },
      ) =>
        invoiceMutationTags(
          companyId,
          invoiceId,
          materialRequestId,
          purchaseSelectionId,
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
} = invoicesApi;
