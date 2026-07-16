import {
  getGetCompaniesCompanyIdPaymentsPaymentIdUrl,
  getGetCompaniesCompanyIdPaymentsUrl,
  getPostCompaniesCompanyIdPaymentsPaymentIdConfirmUrl,
  getPostCompaniesCompanyIdPaymentsPaymentIdRejectUrl,
  getPostCompaniesCompanyIdPaymentsPaymentIdUploadUrl,
  getPostCompaniesCompanyIdPaymentsUrl,
} from '@/api/generated/endpoints';
import type {
  GetCompaniesCompanyIdPayments200,
  GetCompaniesCompanyIdPaymentsParams,
  GetCompaniesCompanyIdPaymentsPaymentId200,
  PostCompaniesCompanyIdPayments201,
  PostCompaniesCompanyIdPaymentsBody,
  PostCompaniesCompanyIdPaymentsPaymentIdConfirm200,
  PostCompaniesCompanyIdPaymentsPaymentIdReject200,
  PostCompaniesCompanyIdPaymentsPaymentIdRejectBody,
  PostCompaniesCompanyIdPaymentsPaymentIdUpload200,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

type CompanyScopedArgs<T = void> = T extends void
  ? { companyId: string }
  : { companyId: string } & T;

function paymentListTag(companyId: string) {
  return [{ type: 'Payments' as const, id: companyId }];
}

function paymentDetailTags(companyId: string, paymentId: string, invoiceId?: string) {
  const tags: Array<
    { type: 'Payments'; id: string } | { type: 'Invoices'; id: string }
  > = [
    { type: 'Payments', id: companyId },
    { type: 'Payments', id: paymentId },
  ];
  if (invoiceId) {
    tags.push({ type: 'Invoices', id: invoiceId });
  }
  return tags;
}

export const paymentsApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listPayments: builder.query<
      GetCompaniesCompanyIdPayments200,
      CompanyScopedArgs<GetCompaniesCompanyIdPaymentsParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: getGetCompaniesCompanyIdPaymentsUrl(companyId),
        params,
      }),
      providesTags: (_result, _error, { companyId }) => paymentListTag(companyId),
    }),
    getPayment: builder.query<
      GetCompaniesCompanyIdPaymentsPaymentId200,
      { companyId: string; paymentId: string }
    >({
      query: ({ companyId, paymentId }) => ({
        url: getGetCompaniesCompanyIdPaymentsPaymentIdUrl(companyId, paymentId),
      }),
      providesTags: (_result, _error, { paymentId }) => [
        { type: 'Payments', id: paymentId },
      ],
    }),
    registerPayment: builder.mutation<
      PostCompaniesCompanyIdPayments201,
      CompanyScopedArgs<PostCompaniesCompanyIdPaymentsBody>
    >({
      query: ({ companyId, ...body }) => ({
        url: getPostCompaniesCompanyIdPaymentsUrl(companyId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, invoiceId }) =>
        paymentDetailTags(companyId, 'list', invoiceId),
    }),
    uploadPaymentProof: builder.mutation<
      PostCompaniesCompanyIdPaymentsPaymentIdUpload200,
      {
        companyId: string;
        paymentId: string;
        invoiceId?: string;
        formData: FormData;
      }
    >({
      query: ({ companyId, paymentId, formData }) => ({
        url: getPostCompaniesCompanyIdPaymentsPaymentIdUploadUrl(companyId, paymentId),
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_result, _error, { companyId, paymentId, invoiceId }) =>
        paymentDetailTags(companyId, paymentId, invoiceId),
    }),
    confirmPayment: builder.mutation<
      PostCompaniesCompanyIdPaymentsPaymentIdConfirm200,
      { companyId: string; paymentId: string; invoiceId?: string }
    >({
      query: ({ companyId, paymentId }) => ({
        url: getPostCompaniesCompanyIdPaymentsPaymentIdConfirmUrl(companyId, paymentId),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { companyId, paymentId, invoiceId }) =>
        paymentDetailTags(companyId, paymentId, invoiceId),
    }),
    rejectPayment: builder.mutation<
      PostCompaniesCompanyIdPaymentsPaymentIdReject200,
      {
        companyId: string;
        paymentId: string;
        invoiceId?: string;
      } & PostCompaniesCompanyIdPaymentsPaymentIdRejectBody
    >({
      query: ({
        companyId,
        paymentId,
        invoiceId: _invoiceId,
        ...body
      }) => ({
        url: getPostCompaniesCompanyIdPaymentsPaymentIdRejectUrl(companyId, paymentId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, paymentId, invoiceId }) =>
        paymentDetailTags(companyId, paymentId, invoiceId),
    }),
  }),
});

export const {
  useListPaymentsQuery,
  useGetPaymentQuery,
  useRegisterPaymentMutation,
  useUploadPaymentProofMutation,
  useConfirmPaymentMutation,
  useRejectPaymentMutation,
} = paymentsApi;
