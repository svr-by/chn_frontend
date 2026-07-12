import type {
  GetCompaniesCompanyIdIntegrationApiKeys200,
  GetCompaniesCompanyIdIntegrationExportsJobId200,
  GetCompaniesCompanyIdIntegrationMappings200,
  GetCompaniesCompanyIdIntegrationWebhooks200,
  PatchCompaniesCompanyIdIntegrationMappingsMappingId200,
  PatchCompaniesCompanyIdIntegrationMappingsMappingIdBody,
  PatchCompaniesCompanyIdIntegrationWebhooksWebhookId200,
  PatchCompaniesCompanyIdIntegrationWebhooksWebhookIdBody,
  PostCompaniesCompanyIdIntegrationApiKeys201,
  PostCompaniesCompanyIdIntegrationApiKeysBody,
  PostCompaniesCompanyIdIntegrationExports202,
  PostCompaniesCompanyIdIntegrationExportsBody,
  PostCompaniesCompanyIdIntegrationMappings201,
  PostCompaniesCompanyIdIntegrationMappingsBody,
  PostCompaniesCompanyIdIntegrationWebhooks201,
  PostCompaniesCompanyIdIntegrationWebhooksBody,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

type CompanyScopedArgs<T = void> = T extends void
  ? { companyId: string }
  : { companyId: string } & T;

function apiKeysTag(companyId: string) {
  return [{ type: 'IntegrationApiKeys' as const, id: companyId }];
}

function mappingsTag(companyId: string) {
  return [{ type: 'IntegrationMappings' as const, id: companyId }];
}

function webhooksTag(companyId: string) {
  return [{ type: 'IntegrationWebhooks' as const, id: companyId }];
}

function exportJobTag(companyId: string, jobId: string) {
  return [
    { type: 'IntegrationExports' as const, id: companyId },
    { type: 'IntegrationExports' as const, id: jobId },
  ];
}

export const integrationApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listApiKeys: builder.query<
      GetCompaniesCompanyIdIntegrationApiKeys200,
      CompanyScopedArgs
    >({
      query: ({ companyId }) => ({
        url: `/companies/${companyId}/integration/api-keys`,
      }),
      providesTags: (_result, _error, { companyId }) => apiKeysTag(companyId),
    }),
    createApiKey: builder.mutation<
      PostCompaniesCompanyIdIntegrationApiKeys201,
      CompanyScopedArgs<PostCompaniesCompanyIdIntegrationApiKeysBody>
    >({
      query: ({ companyId, ...body }) => ({
        url: `/companies/${companyId}/integration/api-keys`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId }) => apiKeysTag(companyId),
    }),
    revokeApiKey: builder.mutation<void, { companyId: string; keyId: string }>({
      query: ({ companyId, keyId }) => ({
        url: `/companies/${companyId}/integration/api-keys/${keyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { companyId }) => apiKeysTag(companyId),
    }),
    listMappings: builder.query<
      GetCompaniesCompanyIdIntegrationMappings200,
      CompanyScopedArgs
    >({
      query: ({ companyId }) => ({
        url: `/companies/${companyId}/integration/mappings`,
      }),
      providesTags: (_result, _error, { companyId }) => mappingsTag(companyId),
    }),
    createMapping: builder.mutation<
      PostCompaniesCompanyIdIntegrationMappings201,
      CompanyScopedArgs<PostCompaniesCompanyIdIntegrationMappingsBody>
    >({
      query: ({ companyId, ...body }) => ({
        url: `/companies/${companyId}/integration/mappings`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId }) => mappingsTag(companyId),
    }),
    updateMapping: builder.mutation<
      PatchCompaniesCompanyIdIntegrationMappingsMappingId200,
      {
        companyId: string;
        mappingId: string;
        body: PatchCompaniesCompanyIdIntegrationMappingsMappingIdBody;
      }
    >({
      query: ({ companyId, mappingId, body }) => ({
        url: `/companies/${companyId}/integration/mappings/${mappingId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId }) => mappingsTag(companyId),
    }),
    deleteMapping: builder.mutation<
      void,
      { companyId: string; mappingId: string }
    >({
      query: ({ companyId, mappingId }) => ({
        url: `/companies/${companyId}/integration/mappings/${mappingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { companyId }) => mappingsTag(companyId),
    }),
    listWebhooks: builder.query<
      GetCompaniesCompanyIdIntegrationWebhooks200,
      CompanyScopedArgs
    >({
      query: ({ companyId }) => ({
        url: `/companies/${companyId}/integration/webhooks`,
      }),
      providesTags: (_result, _error, { companyId }) => webhooksTag(companyId),
    }),
    createWebhook: builder.mutation<
      PostCompaniesCompanyIdIntegrationWebhooks201,
      CompanyScopedArgs<PostCompaniesCompanyIdIntegrationWebhooksBody>
    >({
      query: ({ companyId, ...body }) => ({
        url: `/companies/${companyId}/integration/webhooks`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId }) => webhooksTag(companyId),
    }),
    updateWebhook: builder.mutation<
      PatchCompaniesCompanyIdIntegrationWebhooksWebhookId200,
      {
        companyId: string;
        webhookId: string;
        body: PatchCompaniesCompanyIdIntegrationWebhooksWebhookIdBody;
      }
    >({
      query: ({ companyId, webhookId, body }) => ({
        url: `/companies/${companyId}/integration/webhooks/${webhookId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId }) => webhooksTag(companyId),
    }),
    deleteWebhook: builder.mutation<
      void,
      { companyId: string; webhookId: string }
    >({
      query: ({ companyId, webhookId }) => ({
        url: `/companies/${companyId}/integration/webhooks/${webhookId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { companyId }) => webhooksTag(companyId),
    }),
    createExportJob: builder.mutation<
      PostCompaniesCompanyIdIntegrationExports202,
      CompanyScopedArgs<PostCompaniesCompanyIdIntegrationExportsBody>
    >({
      query: ({ companyId, ...body }) => ({
        url: `/companies/${companyId}/integration/exports`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId }) => [
        { type: 'IntegrationExports', id: companyId },
      ],
    }),
    getExportJob: builder.query<
      GetCompaniesCompanyIdIntegrationExportsJobId200,
      { companyId: string; jobId: string }
    >({
      query: ({ companyId, jobId }) => ({
        url: `/companies/${companyId}/integration/exports/${jobId}`,
      }),
      providesTags: (_result, _error, { companyId, jobId }) =>
        exportJobTag(companyId, jobId),
    }),
  }),
});

export const {
  useListApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
  useListMappingsQuery,
  useCreateMappingMutation,
  useUpdateMappingMutation,
  useDeleteMappingMutation,
  useListWebhooksQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useCreateExportJobMutation,
  useGetExportJobQuery,
} = integrationApi;
