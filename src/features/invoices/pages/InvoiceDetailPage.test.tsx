import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useGetBillableLinesQuery } from '@/api/endpoints/requestsApi';
import { useGetInvoiceQuery } from '@/api/endpoints/invoicesApi';
import { InvoiceDetailPage } from '@/features/invoices/pages/InvoiceDetailPage';
import {
  COMPANY_ID,
  createMembership,
  createSupplierInvoice,
  createTestUser,
  INVOICE_ID,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/api/endpoints/requestsApi', () => ({
  useGetBillableLinesQuery: vi.fn(),
}));

vi.mock('@/api/endpoints/invoicesApi', () => ({
  useGetInvoiceQuery: vi.fn(),
  useUpdateInvoiceMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useAddInvoiceLineMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useUpdateInvoiceLineMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useDeleteInvoiceLineMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useIssueInvoiceMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useConfirmInvoiceMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
}));

vi.mock('@/api/endpoints/paymentsApi', () => ({
  useRegisterPaymentMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseGetInvoiceQuery = vi.mocked(useGetInvoiceQuery);
const mockedUseGetBillableLinesQuery = vi.mocked(useGetBillableLinesQuery);

describe('InvoiceDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseGetBillableLinesQuery.mockReturnValue({
      data: { lines: [] },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetBillableLinesQuery>);

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: [
                'viewInvoices',
                'manageInvoices',
                'managePayments',
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

  it('shows issue action for DRAFT invoice', () => {
    mockedUseGetInvoiceQuery.mockReturnValue({
      data: { invoice: createSupplierInvoice({ status: 'DRAFT' }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetInvoiceQuery>);

    renderWithProviders(
      <Routes>
        <Route path="/app/invoices/:invoiceId" element={<InvoiceDetailPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: `/app/invoices/${INVOICE_ID}`,
      },
    );

    expect(screen.getByText('Issue invoice')).toBeInTheDocument();
    expect(screen.getByText('Add line')).toBeInTheDocument();
  });

  it('shows register payment for ISSUED invoice', () => {
    mockedUseGetInvoiceQuery.mockReturnValue({
      data: {
        invoice: createSupplierInvoice({
          status: 'ISSUED',
          issuedAt: '2026-01-02T00:00:00.000Z',
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetInvoiceQuery>);

    renderWithProviders(
      <Routes>
        <Route path="/app/invoices/:invoiceId" element={<InvoiceDetailPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: `/app/invoices/${INVOICE_ID}`,
      },
    );

    expect(screen.getByText('Register payment')).toBeInTheDocument();
    expect(screen.queryByText('Add line')).not.toBeInTheDocument();
  });
});
