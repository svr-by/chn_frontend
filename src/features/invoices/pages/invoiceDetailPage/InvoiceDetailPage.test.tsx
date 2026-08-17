import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useGetQuoteBillableLinesQuery, useListQuotesQuery } from '@/api/endpoints/quotesApi';
import {
  useGetInvoiceQuery,
  useGetShippableLinesQuery,
  useUpdateInvoiceMutation,
} from '@/api/endpoints/invoicesApi';
import { InvoiceDetailPage } from '@/features/invoices/pages/invoiceDetailPage/InvoiceDetailPage';
import {
  COMPANY_ID,
  createMembership,
  createShippableLine,
  createSupplierInvoice,
  createTestUser,
  INVOICE_ID,
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

vi.mock('@/api/endpoints/quotesApi', () => ({
  useListQuotesQuery: vi.fn(),
  useGetQuoteBillableLinesQuery: vi.fn(),
}));

vi.mock('@/api/endpoints/invoicesApi', () => ({
  useGetInvoiceQuery: vi.fn(),
  useGetShippableLinesQuery: vi.fn(),
  useLazyGetShippableLinesQuery: vi.fn(() => [vi.fn(), { isLoading: false }]),
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

vi.mock('@/api/endpoints/shippingInvoicesApi', () => ({
  useCreateShippingInvoiceMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
}));

vi.mock('@/api/endpoints/commentsApi', () => ({
  useLazyListDocumentCommentsQuery: vi.fn(() => [
    vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ comments: [], nextCursor: null }),
    }),
    { isLoading: false, reset: vi.fn() },
    { lastArg: undefined },
  ]),
  useLazyListDocumentActivityQuery: vi.fn(() => [
    vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ activity: [], nextCursor: null }),
    }),
    { isLoading: false, reset: vi.fn() },
    { lastArg: undefined },
  ]),
  useCreateDocumentCommentMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseGetInvoiceQuery = vi.mocked(useGetInvoiceQuery);
const mockedUseGetShippableLinesQuery = vi.mocked(useGetShippableLinesQuery);
const mockedUseUpdateInvoiceMutation = vi.mocked(useUpdateInvoiceMutation);
const mockedUseListQuotesQuery = vi.mocked(useListQuotesQuery);
const mockedUseGetQuoteBillableLinesQuery = vi.mocked(
  useGetQuoteBillableLinesQuery,
);

function renderDetailPage() {
  return renderWithProviders(
    <Routes>
      <Route
        path="/app/invoices/:invoiceId"
        element={<InvoiceDetailPage />}
      />
    </Routes>,
    {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      route: `/app/invoices/${INVOICE_ID}`,
    },
  );
}

describe('InvoiceDetailPage', () => {
  const updateInvoice = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    updateInvoice.mockReturnValue({
      unwrap: () =>
        Promise.resolve({ invoice: createSupplierInvoice({ status: 'DRAFT' }) }),
    });
    mockedUseUpdateInvoiceMutation.mockReturnValue([
      updateInvoice,
      { isLoading: false, reset: vi.fn(), error: undefined },
    ] as ReturnType<typeof useUpdateInvoiceMutation>);

    mockedUseGetShippableLinesQuery.mockReturnValue({
      data: { invoiceId: INVOICE_ID, lines: [createShippableLine()] },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetShippableLinesQuery>);

    mockedUseListQuotesQuery.mockReturnValue({
      data: { quotes: [{ id: '00000000-0000-0000-0000-000000000070' }] },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListQuotesQuery>);

    mockedUseGetQuoteBillableLinesQuery.mockReturnValue({
      data: { lines: [] },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetQuoteBillableLinesQuery>);

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

    renderDetailPage();

    expect(screen.getByText('Issue invoice')).toBeInTheDocument();
    expect(screen.getByText('Add line')).toBeInTheDocument();
  });

  it('edits invoice number from title action', async () => {
    const user = userEvent.setup();

    mockedUseGetInvoiceQuery.mockReturnValue({
      data: { invoice: createSupplierInvoice({ status: 'DRAFT' }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetInvoiceQuery>);

    renderDetailPage();

    await user.click(
      screen.getByRole('button', { name: 'Edit invoice number' }),
    );
    const numberField = screen.getByLabelText('Invoice number');
    await user.clear(numberField);
    await user.type(numberField, 'INV-999');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(updateInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: COMPANY_ID,
          invoiceId: INVOICE_ID,
          number: 'INV-999',
        }),
      );
    });
  });

  it('shows register payment and add line for ISSUED invoice', () => {
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

    renderDetailPage();

    expect(screen.getByText('Register payment')).toBeInTheDocument();
    expect(screen.getByText('Add line')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Edit invoice number' }),
    ).toBeInTheDocument();
  });

  it('hides line edits for inbound buyer', () => {
    mockedUseGetInvoiceQuery.mockReturnValue({
      data: {
        invoice: createSupplierInvoice({
          status: 'ISSUED',
          issuedAt: '2026-01-02T00:00:00.000Z',
          supplierCompany: {
            id: '00000000-0000-0000-0000-000000000099',
            name: 'Other Supplier',
          },
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetInvoiceQuery>);

    renderDetailPage();

    expect(screen.queryByText('Add line')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit invoice number' }),
    ).not.toBeInTheDocument();
  });

  it('switches to comments tab', async () => {
    const user = userEvent.setup();

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

    renderDetailPage();

    await user.click(screen.getByRole('tab', { name: 'Comments' }));

    expect(await screen.findByText('No comments yet.')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Post comment' }),
    ).toBeInTheDocument();
  });
});
