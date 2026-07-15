import type {
  GetCompaniesCompanyIdImportsJobId200,
  PostCompaniesCompanyIdImportsJobIdConfirm200,
  PostCompaniesCompanyIdImportsRequestLines202,
  PostCompaniesCompanyIdImportsRequestLinesCsvPreview200,
  PostCompaniesCompanyIdImportsRequestLinesHtmPreview200,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

type CompanyScopedArgs<T = void> = T extends void
  ? { companyId: string }
  : { companyId: string } & T;

function importJobTag(companyId: string, jobId: string) {
  return [
    { type: 'Imports' as const, id: companyId },
    { type: 'Imports' as const, id: jobId },
  ];
}

export const importsApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    previewCsvImport: builder.mutation<
      PostCompaniesCompanyIdImportsRequestLinesCsvPreview200,
      CompanyScopedArgs<{ formData: FormData }>
    >({
      query: ({ companyId, formData }) => ({
        url: `/companies/${companyId}/imports/request-lines/csv/preview`,
        method: 'POST',
        body: formData,
      }),
    }),
    previewHtmImport: builder.mutation<
      PostCompaniesCompanyIdImportsRequestLinesHtmPreview200,
      CompanyScopedArgs<{ formData: FormData }>
    >({
      query: ({ companyId, formData }) => ({
        url: `/companies/${companyId}/imports/request-lines/htm/preview`,
        method: 'POST',
        body: formData,
      }),
    }),
    uploadImport: builder.mutation<
      PostCompaniesCompanyIdImportsRequestLines202,
      CompanyScopedArgs<{ formData: FormData }>
    >({
      query: ({ companyId, formData }) => ({
        url: `/companies/${companyId}/imports/request-lines`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_result, _error, { companyId }) => [
        { type: 'Imports', id: companyId },
      ],
    }),
    getImportJob: builder.query<
      GetCompaniesCompanyIdImportsJobId200,
      { companyId: string; jobId: string }
    >({
      query: ({ companyId, jobId }) => ({
        url: `/companies/${companyId}/imports/${jobId}`,
      }),
      providesTags: (_result, _error, { companyId, jobId }) =>
        importJobTag(companyId, jobId),
    }),
    confirmImport: builder.mutation<
      PostCompaniesCompanyIdImportsJobIdConfirm200,
      { companyId: string; jobId: string }
    >({
      query: ({ companyId, jobId }) => ({
        url: `/companies/${companyId}/imports/${jobId}/confirm`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { companyId, jobId }) => [
        ...importJobTag(companyId, jobId),
        { type: 'Requests', id: companyId },
      ],
    }),
  }),
});

export const {
  usePreviewCsvImportMutation,
  usePreviewHtmImportMutation,
  useUploadImportMutation,
  useGetImportJobQuery,
  useConfirmImportMutation,
} = importsApi;
