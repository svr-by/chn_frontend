import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useListInvoicesQuery } from '@/api/endpoints/invoicesApi';
import { useListPartnersQuery } from '@/api/endpoints/partnersApi';
import { InvoicesPage } from '@/features/invoices/pages/invoicesPage/InvoicesPage';
import {
  COMPANY_ID,
  createSupplierInvoiceSummary,
  createTradingPartner,
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

vi.mock('@/api/endpoints/partnersApi', () => ({
  useListPartnersQuery: vi.fn(),
}));

const mockedUseListInvoicesQuery = vi.mocked(useListInvoicesQuery);
const mockedUseListPartnersQuery = vi.mocked(useListPartnersQuery);

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

    mockedUseListPartnersQuery.mockReturnValue({
      data: {
        partners: [createTradingPartner({ status: 'ACTIVE' })],
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListPartnersQuery>);
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
    expect(screen.getByLabelText('Supplier')).toBeInTheDocument();
    expect(screen.getByText('Supplier A')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(mockedUseListInvoicesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'inbound' }),
      expect.anything(),
    );
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
    expect(mockedUseListInvoicesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: REQUEST_ID }),
      expect.anything(),
    );
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

    expect(await screen.findByLabelText('Buyer')).toBeInTheDocument();
    expect(mockedUseListInvoicesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'outbound' }),
      expect.anything(),
    );
  });

  it('applies status filter only after Apply', async () => {
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

    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();

    await user.click(screen.getByLabelText('Status'));
    await user.click(await screen.findByRole('option', { name: 'Issued' }));

    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled();
    expect(mockedUseListInvoicesQuery).not.toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ISSUED' }),
      expect.anything(),
    );

    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockedUseListInvoicesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ISSUED' }),
      expect.anything(),
    );
  });

  it('applies invoiceNumber filter after Apply', async () => {
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

    await user.type(screen.getByLabelText('Invoice #'), 'INV-100');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockedUseListInvoicesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceNumber: 'INV-100' }),
      expect.anything(),
    );
  });
});
