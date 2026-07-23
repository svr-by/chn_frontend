import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { ShippingStatusActions } from '@/features/shipping/components/ShippingStatusActions';
import {
  COMPANY_ID,
  createMembership,
  createTestUser,
  INVOICE_ID,
  SHIPPING_INVOICE_ID,
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

vi.mock('@/api/endpoints/shippingInvoicesApi', () => ({
  useIssueShippingInvoiceMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useMarkShippingInTransitMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useMarkShippingDeliveredMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);

describe('ShippingStatusActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['manageShippingInvoices'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);
  });

  it('shows issue button for DRAFT', () => {
    renderWithProviders(
      <ShippingStatusActions
        companyId={COMPANY_ID}
        shippingInvoiceId={SHIPPING_INVOICE_ID}
        supplierInvoiceId={INVOICE_ID}
        status="DRAFT"
      />,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      },
    );

    expect(screen.getByText('Issue shipping invoice')).toBeInTheDocument();
  });

  it('shows mark in transit for ISSUED', () => {
    renderWithProviders(
      <ShippingStatusActions
        companyId={COMPANY_ID}
        shippingInvoiceId={SHIPPING_INVOICE_ID}
        supplierInvoiceId={INVOICE_ID}
        status="ISSUED"
      />,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      },
    );

    expect(screen.getByText('Mark in transit')).toBeInTheDocument();
  });

  it('shows mark delivered for IN_TRANSIT', () => {
    renderWithProviders(
      <ShippingStatusActions
        companyId={COMPANY_ID}
        shippingInvoiceId={SHIPPING_INVOICE_ID}
        supplierInvoiceId={INVOICE_ID}
        status="IN_TRANSIT"
      />,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      },
    );

    expect(screen.getByText('Mark delivered')).toBeInTheDocument();
  });
});
