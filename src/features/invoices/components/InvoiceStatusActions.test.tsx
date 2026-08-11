import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { InvoiceStatusActions } from '@/features/invoices/components/InvoiceStatusActions';
import {
  COMPANY_ID,
  createMembership,
  createTestUser,
  INVOICE_ID,
  REQUEST_ID,
  QUOTE_ID,
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

vi.mock('@/api/endpoints/invoicesApi', () => ({
  useIssueInvoiceMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useConfirmInvoiceMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);

describe('InvoiceStatusActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

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
  });

  it('shows issue button for DRAFT', () => {
    renderWithProviders(
      <InvoiceStatusActions
        companyId={COMPANY_ID}
        invoiceId={INVOICE_ID}
        requestIds={[REQUEST_ID]}
        quoteIds={[QUOTE_ID]}
        status="DRAFT"
      />,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      },
    );

    expect(screen.getByText('Issue invoice')).toBeInTheDocument();
  });

  it('shows confirm button for PAID', () => {
    renderWithProviders(
      <InvoiceStatusActions
        companyId={COMPANY_ID}
        invoiceId={INVOICE_ID}
        requestIds={[REQUEST_ID]}
        quoteIds={[QUOTE_ID]}
        status="PAID"
      />,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      },
    );

    expect(screen.getByText('Confirm invoice')).toBeInTheDocument();
  });
});
