import {
  getDeleteCompaniesCompanyIdQuotesQuoteIdLinesLineIdUrl,
  getGetCompaniesCompanyIdQuotesQuoteIdUrl,
  getGetCompaniesCompanyIdQuotesUrl,
  getPatchCompaniesCompanyIdQuotesQuoteIdLinesLineIdUrl,
  getPatchCompaniesCompanyIdQuotesQuoteIdUrl,
  getPostCompaniesCompanyIdQuotesQuoteIdLinesUrl,
  getPostCompaniesCompanyIdQuotesQuoteIdSubmitUrl,
  getPostCompaniesCompanyIdQuotesUrl,
} from '@/api/generated/endpoints';
import type {
  DeleteCompaniesCompanyIdQuotesQuoteIdLinesLineId200,
  GetCompaniesCompanyIdQuotes200,
  GetCompaniesCompanyIdQuotesParams,
  GetCompaniesCompanyIdQuotesQuoteId200,
  PatchCompaniesCompanyIdQuotesQuoteId200,
  PatchCompaniesCompanyIdQuotesQuoteIdBody,
  PatchCompaniesCompanyIdQuotesQuoteIdLinesLineId200,
  PatchCompaniesCompanyIdQuotesQuoteIdLinesLineIdBody,
  PostCompaniesCompanyIdQuotes201,
  PostCompaniesCompanyIdQuotesBody,
  PostCompaniesCompanyIdQuotesQuoteIdLines201,
  PostCompaniesCompanyIdQuotesQuoteIdLinesBody,
  PostCompaniesCompanyIdQuotesQuoteIdSubmit200,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

type CompanyScopedArgs<T = void> = T extends void
  ? { companyId: string }
  : { companyId: string } & T;

function quoteListTag(companyId: string) {
  return [{ type: 'Quotes' as const, id: companyId }];
}

function quoteDetailTags(companyId: string, quoteId: string, requestId?: string) {
  const tags: Array<
    { type: 'Quotes'; id: string } | { type: 'Requests'; id: string }
  > = [
    { type: 'Quotes', id: companyId },
    { type: 'Quotes', id: quoteId },
  ];
  if (requestId) {
    tags.push({ type: 'Requests', id: requestId });
  }
  return tags;
}

export const quotesApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listQuotes: builder.query<
      GetCompaniesCompanyIdQuotes200,
      CompanyScopedArgs<GetCompaniesCompanyIdQuotesParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: getGetCompaniesCompanyIdQuotesUrl(companyId),
        params,
      }),
      providesTags: (_result, _error, { companyId }) => quoteListTag(companyId),
    }),
    getQuote: builder.query<
      GetCompaniesCompanyIdQuotesQuoteId200,
      { companyId: string; quoteId: string }
    >({
      query: ({ companyId, quoteId }) => ({
        url: getGetCompaniesCompanyIdQuotesQuoteIdUrl(companyId, quoteId),
      }),
      providesTags: (_result, _error, { quoteId }) => [
        { type: 'Quotes', id: quoteId },
      ],
    }),
    createQuote: builder.mutation<
      PostCompaniesCompanyIdQuotes201,
      CompanyScopedArgs<PostCompaniesCompanyIdQuotesBody>
    >({
      query: ({ companyId, ...body }) => ({
        url: getPostCompaniesCompanyIdQuotesUrl(companyId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, requestId }) => [
        ...quoteListTag(companyId),
        { type: 'Requests', id: requestId },
      ],
    }),
    updateQuote: builder.mutation<
      PatchCompaniesCompanyIdQuotesQuoteId200,
      {
        companyId: string;
        quoteId: string;
        materialRequestId?: string;
      } & PatchCompaniesCompanyIdQuotesQuoteIdBody
    >({
      query: ({ companyId, quoteId, materialRequestId: _requestId, ...body }) => ({
        url: getPatchCompaniesCompanyIdQuotesQuoteIdUrl(companyId, quoteId),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, quoteId, materialRequestId }) =>
        quoteDetailTags(companyId, quoteId, materialRequestId),
    }),
    addQuoteLine: builder.mutation<
      PostCompaniesCompanyIdQuotesQuoteIdLines201,
      {
        companyId: string;
        quoteId: string;
        materialRequestId?: string;
      } & PostCompaniesCompanyIdQuotesQuoteIdLinesBody
    >({
      query: ({ companyId, quoteId, materialRequestId: _requestId, ...body }) => ({
        url: getPostCompaniesCompanyIdQuotesQuoteIdLinesUrl(companyId, quoteId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, quoteId, materialRequestId }) =>
        quoteDetailTags(companyId, quoteId, materialRequestId),
    }),
    updateQuoteLine: builder.mutation<
      PatchCompaniesCompanyIdQuotesQuoteIdLinesLineId200,
      {
        companyId: string;
        quoteId: string;
        lineId: string;
        materialRequestId?: string;
      } & PatchCompaniesCompanyIdQuotesQuoteIdLinesLineIdBody
    >({
      query: ({
        companyId,
        quoteId,
        lineId,
        materialRequestId: _requestId,
        ...body
      }) => ({
        url: getPatchCompaniesCompanyIdQuotesQuoteIdLinesLineIdUrl(companyId, quoteId, lineId),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, quoteId, materialRequestId }) =>
        quoteDetailTags(companyId, quoteId, materialRequestId),
    }),
    deleteQuoteLine: builder.mutation<
      DeleteCompaniesCompanyIdQuotesQuoteIdLinesLineId200,
      {
        companyId: string;
        quoteId: string;
        lineId: string;
        materialRequestId?: string;
      }
    >({
      query: ({ companyId, quoteId, lineId }) => ({
        url: getDeleteCompaniesCompanyIdQuotesQuoteIdLinesLineIdUrl(companyId, quoteId, lineId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { companyId, quoteId, materialRequestId }) =>
        quoteDetailTags(companyId, quoteId, materialRequestId),
    }),
    submitQuote: builder.mutation<
      PostCompaniesCompanyIdQuotesQuoteIdSubmit200,
      {
        companyId: string;
        quoteId: string;
        materialRequestId?: string;
      }
    >({
      query: ({ companyId, quoteId }) => ({
        url: getPostCompaniesCompanyIdQuotesQuoteIdSubmitUrl(companyId, quoteId),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { companyId, quoteId, materialRequestId }) =>
        quoteDetailTags(companyId, quoteId, materialRequestId),
    }),
  }),
});

export const {
  useListQuotesQuery,
  useGetQuoteQuery,
  useCreateQuoteMutation,
  useUpdateQuoteMutation,
  useAddQuoteLineMutation,
  useUpdateQuoteLineMutation,
  useDeleteQuoteLineMutation,
  useSubmitQuoteMutation,
} = quotesApi;
