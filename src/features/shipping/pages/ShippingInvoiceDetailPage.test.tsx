import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useGetShippableLinesQuery } from '@/api/endpoints/invoicesApi';
import { useGetShippingInvoiceQuery } from '@/api/endpoints/shippingInvoicesApi';
import { ShippingInvoiceDetailPage } from '@/features/shipping/pages/ShippingInvoiceDetailPage';
import {
  COMPANY_ID,
  createMembership,
  createShippingInvoice,
  createTestUser,
  SHIPPING_INVOICE_ID,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/api/endpoints/invoicesApi', () => ({
  useGetShippableLinesQuery: vi.fn(),
}));

vi.mock('@/api/endpoints/shippingInvoicesApi', () => ({
  useGetShippingInvoiceQuery: vi.fn(),
  useUpdateShippingInvoiceMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useAddShippingLineMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useUpdateShippingLineMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useDeleteShippingLineMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
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

vi.mock(
  '@/features/consolidations/hooks/useCreateConsolidationFromShippingInvoice',
  () => ({
    useCreateConsolidationFromShippingInvoice: vi.fn(() => ({
      createConsolidationFromShippingInvoice: vi.fn(),
      isCreating: false,
      error: undefined,
    })),
  }),
);

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseGetShippingInvoiceQuery = vi.mocked(useGetShippingInvoiceQuery);
const mockedUseGetShippableLinesQuery = vi.mocked(useGetShippableLinesQuery);

describe('ShippingInvoiceDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseGetShippableLinesQuery.mockReturnValue({
      data: { invoiceId: 'invoice-id', lines: [] },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetShippableLinesQuery>);

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: [
                'viewShippingInvoices',
                'manageShippingInvoices',
                'manageConsolidations',
              ],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);
  });

  it('shows issue action for DRAFT shipping invoice', () => {
    mockedUseGetShippingInvoiceQuery.mockReturnValue({
      data: { shippingInvoice: createShippingInvoice({ status: 'DRAFT' }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetShippingInvoiceQuery>);

    renderWithProviders(
      <Routes>
        <Route
          path="/app/shipping-invoices/:shippingInvoiceId"
          element={<ShippingInvoiceDetailPage />}
        />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: `/app/shipping-invoices/${SHIPPING_INVOICE_ID}`,
      },
    );

    expect(screen.getByText('Issue shipping invoice')).toBeInTheDocument();
    expect(screen.getByText('Add line')).toBeInTheDocument();
  });

  it('shows mark in transit for ISSUED shipping invoice', () => {
    mockedUseGetShippingInvoiceQuery.mockReturnValue({
      data: {
        shippingInvoice: createShippingInvoice({
          status: 'ISSUED',
          issuedAt: '2026-01-02T00:00:00.000Z',
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetShippingInvoiceQuery>);

    renderWithProviders(
      <Routes>
        <Route
          path="/app/shipping-invoices/:shippingInvoiceId"
          element={<ShippingInvoiceDetailPage />}
        />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: `/app/shipping-invoices/${SHIPPING_INVOICE_ID}`,
      },
    );

    expect(screen.getByText('Mark in transit')).toBeInTheDocument();
    expect(screen.queryByText('Add line')).not.toBeInTheDocument();
  });

  it('shows create consolidation for DELIVERED shipping invoice', () => {
    mockedUseGetShippingInvoiceQuery.mockReturnValue({
      data: {
        shippingInvoice: createShippingInvoice({
          status: 'DELIVERED',
          deliveredAt: '2026-01-05T00:00:00.000Z',
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetShippingInvoiceQuery>);

    renderWithProviders(
      <Routes>
        <Route
          path="/app/shipping-invoices/:shippingInvoiceId"
          element={<ShippingInvoiceDetailPage />}
        />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: `/app/shipping-invoices/${SHIPPING_INVOICE_ID}`,
      },
    );

    expect(screen.getByText('Create consolidation')).toBeInTheDocument();
    expect(screen.getByText('View consolidations')).toBeInTheDocument();
  });
});
