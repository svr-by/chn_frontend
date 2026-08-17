import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useCreateInvoiceMutation,
} from '@/api/endpoints/invoicesApi';
import {
  useGetQuoteBillableLinesQuery,
  useGetQuoteQuery,
} from '@/api/endpoints/quotesApi';
import { InvoiceDraftLinesSection } from '@/features/invoices/components/invoiceDraftLinesSection/InvoiceDraftLinesSection';
import { InvoiceNewPage } from '@/features/invoices/pages/invoiceNewPage/InvoiceNewPage';
import {
  COMPANY_ID,
  REQUEST_ID,
  createBillableLine,
  createMembership,
  createSupplierQuote,
  createTestUser,
  QUOTE_ID,
} from '@/test/fixtures';
import { billableToDraftLine } from '@/features/invoices/lib/draftInvoiceLine';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/api/endpoints/invoicesApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/api/endpoints/invoicesApi')>();
  return {
    ...actual,
    useCreateInvoiceMutation: vi.fn(),
  };
});

vi.mock('@/api/endpoints/quotesApi', () => ({
  useGetQuoteQuery: vi.fn(),
  useListQuotesQuery: vi.fn(() => ({
    data: { quotes: [] },
    isLoading: false,
  })),
  useGetQuoteBillableLinesQuery: vi.fn(() => ({
    data: { lines: [] },
    isLoading: false,
  })),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseCreateInvoiceMutation = vi.mocked(useCreateInvoiceMutation);
const mockedUseGetQuoteQuery = vi.mocked(useGetQuoteQuery);
const mockedUseGetQuoteBillableLinesQuery = vi.mocked(
  useGetQuoteBillableLinesQuery,
);

function renderNewPage(route = '/app/invoices/new') {
  return renderWithProviders(
    <Routes>
      <Route path="/app/invoices" element={<div>Invoices list</div>} />
      <Route path="/app/invoices/new" element={<InvoiceNewPage />} />
    </Routes>,
    {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      route,
    },
  );
}

function mockManageInvoicesUser() {
  mockedUseGetMeQuery.mockReturnValue({
    data: {
      user: createTestUser({
        memberships: [
          createMembership({
            effectivePermissions: ['manageInvoices'],
          }),
        ],
      }),
    },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  } as ReturnType<typeof useGetMeQuery>);
}

describe('InvoiceNewPage', () => {
  const createInvoice = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    createInvoice.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          invoice: { id: '00000000-0000-0000-0000-000000000080' },
        }),
    });
    mockedUseCreateInvoiceMutation.mockReturnValue([
      createInvoice,
      { isLoading: false, reset: vi.fn(), error: undefined },
    ] as ReturnType<typeof useCreateInvoiceMutation>);

    mockedUseGetQuoteQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetQuoteQuery>);

    mockedUseGetQuoteBillableLinesQuery.mockReturnValue({
      data: { lines: [] },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetQuoteBillableLinesQuery>);

    mockManageInvoicesUser();
  });

  it('renders lines and notes tabs', () => {
    renderNewPage();

    expect(screen.getByRole('heading', { name: 'Create invoice' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Lines' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Notes' })).toBeInTheDocument();
  });

  it('shows notes field on notes tab', async () => {
    const user = userEvent.setup();
    renderNewPage();

    await user.click(screen.getByRole('tab', { name: 'Notes' }));

    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
  });

  it('requires at least one line before saving', async () => {
    const user = userEvent.setup();
    renderNewPage();

    await user.type(screen.getByLabelText('Invoice number'), 'INV-001');
    await user.click(screen.getByRole('combobox', { name: 'Currency' }));
    await user.click(screen.getByRole('option', { name: 'USD' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      await screen.findByText('Add at least one line before saving.'),
    ).toBeInTheDocument();
    expect(createInvoice).not.toHaveBeenCalled();
    expect(screen.getByRole('tab', { name: 'Lines' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('redirects without manageInvoices permission', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewInvoices'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderNewPage();

    expect(screen.getByText('Invoices list')).toBeInTheDocument();
  });

  it('prefills draft lines from the quote in the query string', async () => {
    mockedUseGetQuoteQuery.mockReturnValue({
      data: { quote: createSupplierQuote({ status: 'ACCEPTED' }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetQuoteQuery>);
    mockedUseGetQuoteBillableLinesQuery.mockReturnValue({
      data: { lines: [createBillableLine()] },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetQuoteBillableLinesQuery>);

    renderNewPage(`/app/invoices/new?quoteId=${QUOTE_ID}`);

    expect(await screen.findByText('Bolt M8')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Currency' })).toHaveTextContent(
      'USD',
    );
  });

  it('does not restore prefilled lines after the user deletes them', async () => {
    const user = userEvent.setup();

    mockedUseGetQuoteQuery.mockReturnValue({
      data: { quote: createSupplierQuote({ status: 'ACCEPTED' }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetQuoteQuery>);
    mockedUseGetQuoteBillableLinesQuery.mockReturnValue({
      data: { lines: [createBillableLine()] },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetQuoteBillableLinesQuery>);

    renderNewPage(`/app/invoices/new?quoteId=${QUOTE_ID}`);

    expect(await screen.findByText('Bolt M8')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.queryByText('Bolt M8')).not.toBeInTheDocument();
    });
  });
});

describe('InvoiceDraftLinesSection', () => {
  const draftLine = billableToDraftLine({
    billable: createBillableLine(),
    quantity: '2',
    requestId: REQUEST_ID,
    currency: 'USD',
    buyerCompanyId: 'buyer-1',
    quoteId: '00000000-0000-0000-0000-000000000070',
  });

  it('removes a line from the table', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <InvoiceDraftLinesSection
        companyId={COMPANY_ID}
        currency="USD"
        lines={[draftLine]}
        onChange={onChange}
        onAddLine={vi.fn()}
        existingSelectionLineIds={[draftLine.selectionLineId]}
      />,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      },
    );

    expect(screen.getByText('Bolt M8')).toBeInTheDocument();
    expect(screen.queryByText(REQUEST_ID.slice(0, 8))).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith([]);
    });
  });
});
