import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useListInvoicesQuery } from '@/api/endpoints/invoicesApi';
import { InvoicesPage } from '@/features/invoices/pages/InvoicesPage';
import {
  COMPANY_ID,
  createSupplierInvoiceSummary,
  REQUEST_ID,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/requestsApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/api/endpoints/requestsApi')>();
  return {
    ...actual,
    useListRequestsQuery: vi.fn(() => ({
      data: { requests: [], pagination: { total: 0 } },
      isLoading: false,
    })),
    useLazyGetBillableLinesQuery: vi.fn(() => [vi.fn(), { isLoading: false }]),
  };
});

vi.mock('@/api/endpoints/invoicesApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/api/endpoints/invoicesApi')>();
  return {
    ...actual,
    useListInvoicesQuery: vi.fn(),
    useCreateInvoiceMutation: vi.fn(() => [
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ]),
  };
});

const mockedUseListInvoicesQuery = vi.mocked(useListInvoicesQuery);

describe('InvoicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseListInvoicesQuery.mockReturnValue({
      data: {
        invoices: [createSupplierInvoiceSummary()],
        pagination: { total: 1, limit: 20, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListInvoicesQuery>);
  });

  it('renders inbound tab by default', () => {
    renderWithProviders(
      <Routes>
        <Route path="/app/invoices" element={<InvoicesPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/invoices',
      },
    );

    expect(screen.getByText('Invoices')).toBeInTheDocument();
    expect(screen.getByText('Supplier A')).toBeInTheDocument();
  });

  it('applies requestId filter from URL', () => {
    renderWithProviders(
      <Routes>
        <Route path="/app/invoices" element={<InvoicesPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: `/app/invoices?requestId=${REQUEST_ID}`,
      },
    );

    expect(
      screen.getByText(`Filtered by request ${REQUEST_ID.slice(0, 8)}`),
    ).toBeInTheDocument();
  });

  it('switches to outbound tab', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/app/invoices" element={<InvoicesPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/invoices',
      },
    );

    await user.click(screen.getByRole('tab', { name: 'Outbound' }));

    expect(mockedUseListInvoicesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'outbound' }),
      expect.anything(),
    );
  });
});
