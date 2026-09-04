import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useDeleteQuoteMutation,
  useRejectQuoteMutation,
  useUnrejectQuoteMutation,
  useUnsubmitQuoteMutation,
} from '@/api/endpoints/quotesApi';
import { QuoteStatusActions } from '@/features/quotes/components/quoteStatusActions/QuoteStatusActions';
import {
  COMPANY_ID,
  QUOTE_ID,
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

vi.mock('@/api/endpoints/quotesApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/api/endpoints/quotesApi')>();
  return {
    ...actual,
    useDeleteQuoteMutation: vi.fn(),
    useUnsubmitQuoteMutation: vi.fn(),
    useRejectQuoteMutation: vi.fn(),
    useUnrejectQuoteMutation: vi.fn(),
  };
});

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseDeleteQuoteMutation = vi.mocked(useDeleteQuoteMutation);
const mockedUseUnsubmitQuoteMutation = vi.mocked(useUnsubmitQuoteMutation);
const mockedUseRejectQuoteMutation = vi.mocked(useRejectQuoteMutation);
const mockedUseUnrejectQuoteMutation = vi.mocked(useUnrejectQuoteMutation);

function mockManageQuotes() {
  mockedUseGetMeQuery.mockReturnValue({
    data: {
      user: createTestUser({
        memberships: [
          createMembership({
            effectivePermissions: ['manageQuotes'],
          }),
        ],
      }),
    },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  } as ReturnType<typeof useGetMeQuery>);
}

describe('QuoteStatusActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockManageQuotes();

    const idle = [vi.fn(), { isLoading: false, error: undefined, reset: vi.fn() }];
    mockedUseDeleteQuoteMutation.mockReturnValue(
      idle as unknown as ReturnType<typeof useDeleteQuoteMutation>,
    );
    mockedUseUnsubmitQuoteMutation.mockReturnValue(
      idle as unknown as ReturnType<typeof useUnsubmitQuoteMutation>,
    );
    mockedUseRejectQuoteMutation.mockReturnValue(
      idle as unknown as ReturnType<typeof useRejectQuoteMutation>,
    );
    mockedUseUnrejectQuoteMutation.mockReturnValue(
      idle as unknown as ReturnType<typeof useUnrejectQuoteMutation>,
    );
  });

  it('shows reject on SUBMITTED without selections', () => {
    renderWithProviders(
      <QuoteStatusActions
        companyId={COMPANY_ID}
        quoteId={QUOTE_ID}
        status="SUBMITTED"
        hasSelections={false}
      />,
      { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
    );

    expect(
      screen.getByRole('menuitem', { name: 'Reject quote' }),
    ).toBeInTheDocument();
  });

  it('hides reject when buyer selections exist', () => {
    renderWithProviders(
      <QuoteStatusActions
        companyId={COMPANY_ID}
        quoteId={QUOTE_ID}
        status="SUBMITTED"
        hasSelections
      />,
      { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
    );

    expect(
      screen.queryByRole('menuitem', { name: 'Reject quote' }),
    ).not.toBeInTheDocument();
  });

  it('hides undo reject for supplier when status is REJECTED', () => {
    renderWithProviders(
      <QuoteStatusActions
        companyId={COMPANY_ID}
        quoteId={QUOTE_ID}
        status="REJECTED"
      />,
      { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
    );

    expect(
      screen.queryByRole('menuitem', { name: 'Undo reject' }),
    ).not.toBeInTheDocument();
  });

  describe('buyer actor', () => {
    it('shows reject on SUBMITTED without selections', () => {
      renderWithProviders(
        <QuoteStatusActions
          actor="buyer"
          companyId={COMPANY_ID}
          quoteId={QUOTE_ID}
          status="SUBMITTED"
          hasSelections={false}
        />,
        { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
      );

      expect(
        screen.getByRole('menuitem', { name: 'Reject quote' }),
      ).toBeInTheDocument();
    });

    it('shows undo reject when status is REJECTED', () => {
      renderWithProviders(
        <QuoteStatusActions
          actor="buyer"
          companyId={COMPANY_ID}
          quoteId={QUOTE_ID}
          status="REJECTED"
        />,
        { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
      );

      expect(
        screen.getByRole('menuitem', { name: 'Undo reject' }),
      ).toBeInTheDocument();
    });

    it('shows reject on PARTIALLY_ACCEPTED without selections', () => {
      renderWithProviders(
        <QuoteStatusActions
          actor="buyer"
          companyId={COMPANY_ID}
          quoteId={QUOTE_ID}
          status="PARTIALLY_ACCEPTED"
          hasSelections={false}
        />,
        { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
      );

      expect(
        screen.getByRole('menuitem', { name: 'Reject quote' }),
      ).toBeInTheDocument();
    });

    it('does not show delete or unsubmit', () => {
      renderWithProviders(
        <QuoteStatusActions
          actor="buyer"
          companyId={COMPANY_ID}
          quoteId={QUOTE_ID}
          status="SUBMITTED"
          hasSelections={false}
        />,
        { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
      );

      expect(
        screen.queryByRole('menuitem', { name: 'Delete quote' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'Return to draft' }),
      ).not.toBeInTheDocument();
    });

    it('hides reject when selections exist', () => {
      renderWithProviders(
        <QuoteStatusActions
          actor="buyer"
          companyId={COMPANY_ID}
          quoteId={QUOTE_ID}
          status="SUBMITTED"
          hasSelections
        />,
        { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
      );

      expect(
        screen.queryByRole('menuitem', { name: 'Reject quote' }),
      ).not.toBeInTheDocument();
    });

    it('does not show reject on DRAFT', () => {
      renderWithProviders(
        <QuoteStatusActions
          actor="buyer"
          companyId={COMPANY_ID}
          quoteId={QUOTE_ID}
          status="DRAFT"
        />,
        { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
      );

      expect(
        screen.queryByRole('menuitem', { name: 'Reject quote' }),
      ).not.toBeInTheDocument();
    });
  });
});
