import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { ConsolidationStatusActions } from '@/features/consolidations/components/ConsolidationStatusActions';
import {
  COMPANY_ID,
  CONSOLIDATION_ID,
  createMembership,
  createTestUser,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/api/endpoints/consolidationsApi', () => ({
  usePlanConsolidationMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useMarkConsolidationInTransitMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useMarkConsolidationCustomsMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useMarkConsolidationDeliveredMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);

describe('ConsolidationStatusActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['manageConsolidations'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);
  });

  it('shows plan button for DRAFT', () => {
    renderWithProviders(
      <ConsolidationStatusActions
        companyId={COMPANY_ID}
        consolidationId={CONSOLIDATION_ID}
        status="DRAFT"
      />,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      },
    );

    expect(screen.getByText('Plan consolidation')).toBeInTheDocument();
  });

  it('shows mark in transit for PLANNED', () => {
    renderWithProviders(
      <ConsolidationStatusActions
        companyId={COMPANY_ID}
        consolidationId={CONSOLIDATION_ID}
        status="PLANNED"
      />,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      },
    );

    expect(screen.getByText('Mark in transit')).toBeInTheDocument();
  });

  it('shows mark customs for IN_TRANSIT', () => {
    renderWithProviders(
      <ConsolidationStatusActions
        companyId={COMPANY_ID}
        consolidationId={CONSOLIDATION_ID}
        status="IN_TRANSIT"
      />,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      },
    );

    expect(screen.getByText('Mark at customs')).toBeInTheDocument();
  });

  it('shows mark delivered for CUSTOMS', () => {
    renderWithProviders(
      <ConsolidationStatusActions
        companyId={COMPANY_ID}
        consolidationId={CONSOLIDATION_ID}
        status="CUSTOMS"
      />,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      },
    );

    expect(screen.getByText('Mark delivered')).toBeInTheDocument();
  });
});
