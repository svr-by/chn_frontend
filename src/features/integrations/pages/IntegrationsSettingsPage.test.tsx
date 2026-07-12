import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useCreateApiKeyMutation,
  useCreateExportJobMutation,
  useCreateMappingMutation,
  useCreateWebhookMutation,
  useDeleteMappingMutation,
  useDeleteWebhookMutation,
  useGetExportJobQuery,
  useListApiKeysQuery,
  useListMappingsQuery,
  useListWebhooksQuery,
  useRevokeApiKeyMutation,
  useUpdateMappingMutation,
  useUpdateWebhookMutation,
} from '@/api/endpoints/integrationApi';
import { IntegrationsSettingsPage } from '@/features/integrations/pages/IntegrationsSettingsPage';
import {
  COMPANY_ID,
  createApiKey,
  createMembership,
  createTestUser,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/api/endpoints/integrationApi', () => ({
  useListApiKeysQuery: vi.fn(),
  useCreateApiKeyMutation: vi.fn(),
  useRevokeApiKeyMutation: vi.fn(),
  useListMappingsQuery: vi.fn(),
  useCreateMappingMutation: vi.fn(),
  useUpdateMappingMutation: vi.fn(),
  useDeleteMappingMutation: vi.fn(),
  useListWebhooksQuery: vi.fn(),
  useCreateWebhookMutation: vi.fn(),
  useUpdateWebhookMutation: vi.fn(),
  useDeleteWebhookMutation: vi.fn(),
  useCreateExportJobMutation: vi.fn(),
  useGetExportJobQuery: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseListApiKeysQuery = vi.mocked(useListApiKeysQuery);
const mockedUseCreateApiKeyMutation = vi.mocked(useCreateApiKeyMutation);
const mockedUseRevokeApiKeyMutation = vi.mocked(useRevokeApiKeyMutation);
const mockedUseListMappingsQuery = vi.mocked(useListMappingsQuery);
const mockedUseCreateMappingMutation = vi.mocked(useCreateMappingMutation);
const mockedUseUpdateMappingMutation = vi.mocked(useUpdateMappingMutation);
const mockedUseDeleteMappingMutation = vi.mocked(useDeleteMappingMutation);
const mockedUseListWebhooksQuery = vi.mocked(useListWebhooksQuery);
const mockedUseCreateWebhookMutation = vi.mocked(useCreateWebhookMutation);
const mockedUseUpdateWebhookMutation = vi.mocked(useUpdateWebhookMutation);
const mockedUseDeleteWebhookMutation = vi.mocked(useDeleteWebhookMutation);
const mockedUseCreateExportJobMutation = vi.mocked(useCreateExportJobMutation);
const mockedUseGetExportJobQuery = vi.mocked(useGetExportJobQuery);

function mockMutationHook(mock: ReturnType<typeof vi.fn>) {
  return [mock, { isLoading: false, reset: vi.fn() }] as const;
}

describe('IntegrationsSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseListMappingsQuery.mockReturnValue({
      data: { mappings: [] },
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useListMappingsQuery>);

    mockedUseListWebhooksQuery.mockReturnValue({
      data: { webhooks: [] },
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useListWebhooksQuery>);

    mockedUseCreateApiKeyMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useCreateApiKeyMutation>,
    );
    mockedUseRevokeApiKeyMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useRevokeApiKeyMutation>,
    );
    mockedUseCreateMappingMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useCreateMappingMutation>,
    );
    mockedUseUpdateMappingMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useUpdateMappingMutation>,
    );
    mockedUseDeleteMappingMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useDeleteMappingMutation>,
    );
    mockedUseCreateWebhookMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useCreateWebhookMutation>,
    );
    mockedUseUpdateWebhookMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useUpdateWebhookMutation>,
    );
    mockedUseDeleteWebhookMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useDeleteWebhookMutation>,
    );
    mockedUseCreateExportJobMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useCreateExportJobMutation>,
    );
    mockedUseGetExportJobQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetExportJobQuery>);
  });

  it('shows access denied without manageIntegrations permission', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: { user: createTestUser() },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    mockedUseListApiKeysQuery.mockReturnValue({
      data: { apiKeys: [] },
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useListApiKeysQuery>);

    renderWithProviders(<IntegrationsSettingsPage />, {
      preloadedState: {
        auth: {
          activeCompanyId: COMPANY_ID,
          isBootstrapped: true,
        },
      },
      route: '/app/settings/integrations',
    });

    expect(
      screen.getByText(/do not have permission to manage integrations/i),
    ).toBeInTheDocument();
  });

  it('renders API keys tab for users with manageIntegrations', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['manageIntegrations'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    mockedUseListApiKeysQuery.mockReturnValue({
      data: { apiKeys: [createApiKey()] },
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useListApiKeysQuery>);

    renderWithProviders(<IntegrationsSettingsPage />, {
      preloadedState: {
        auth: {
          activeCompanyId: COMPANY_ID,
          isBootstrapped: true,
        },
      },
      route: '/app/settings/integrations',
    });

    expect(screen.getByText('ERP sync')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Mappings/i })).toBeInTheDocument();
  });

  it('switches to mappings tab', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['manageIntegrations'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    mockedUseListApiKeysQuery.mockReturnValue({
      data: { apiKeys: [] },
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useListApiKeysQuery>);

    renderWithProviders(<IntegrationsSettingsPage />, {
      preloadedState: {
        auth: {
          activeCompanyId: COMPANY_ID,
          isBootstrapped: true,
        },
      },
      route: '/app/settings/integrations',
    });

    fireEvent.click(screen.getByRole('tab', { name: /Mappings/i }));
    expect(screen.getByText(/Partner & product mappings/i)).toBeInTheDocument();
  });
});
