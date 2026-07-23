import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useListShippingInvoicesQuery } from '@/api/endpoints/shippingInvoicesApi';
import { ShippingInvoicesPage } from '@/features/shipping/pages/ShippingInvoicesPage';
import {
  COMPANY_ID,
  createShippingInvoiceSummary,
  INVOICE_ID,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/invoicesApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/api/endpoints/invoicesApi')>();
  return {
    ...actual,
    useListInvoicesQuery: vi.fn(() => ({
      data: { invoices: [], pagination: { total: 0 } },
      isLoading: false,
    })),
    useLazyGetShippableLinesQuery: vi.fn(() => [vi.fn(), { isLoading: false }]),
  };
});

vi.mock('@/api/endpoints/shippingInvoicesApi', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('@/api/endpoints/shippingInvoicesApi')
    >();
  return {
    ...actual,
    useListShippingInvoicesQuery: vi.fn(),
    useCreateShippingInvoiceMutation: vi.fn(() => [
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ]),
  };
});

const mockedUseListShippingInvoicesQuery = vi.mocked(
  useListShippingInvoicesQuery,
);

describe('ShippingInvoicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseListShippingInvoicesQuery.mockReturnValue({
      data: {
        shippingInvoices: [createShippingInvoiceSummary()],
        pagination: { total: 1, limit: 20, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListShippingInvoicesQuery>);
  });

  it('renders inbound tab by default', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/app/shipping-invoices"
          element={<ShippingInvoicesPage />}
        />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/shipping-invoices',
      },
    );

    expect(screen.getByText('Shipping invoices')).toBeInTheDocument();
    expect(screen.getByText('Supplier A')).toBeInTheDocument();
  });

  it('applies supplierInvoiceId filter from URL', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/app/shipping-invoices"
          element={<ShippingInvoicesPage />}
        />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: `/app/shipping-invoices?supplierInvoiceId=${INVOICE_ID}`,
      },
    );

    expect(
      screen.getByText(`Filtered by invoice ${INVOICE_ID.slice(0, 8)}`),
    ).toBeInTheDocument();
  });

  it('switches to outbound tab', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route
          path="/app/shipping-invoices"
          element={<ShippingInvoicesPage />}
        />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/shipping-invoices',
      },
    );

    await user.click(screen.getByRole('tab', { name: 'Outbound' }));

    expect(mockedUseListShippingInvoicesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'outbound' }),
      expect.anything(),
    );
  });
});
