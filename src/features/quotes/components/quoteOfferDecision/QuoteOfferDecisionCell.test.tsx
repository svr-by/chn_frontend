import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useDeleteQuoteLineSelectionMutation,
  usePutQuoteLineSelectionMutation,
  useRejectQuoteLineMutation,
  useUnrejectQuoteLineMutation,
} from '@/api/endpoints/quotesApi';
import { QuoteOfferDecisionCell } from '@/features/quotes/components/quoteOfferDecision/QuoteOfferDecisionCell';
import {
  COMPANY_ID,
  QUOTE_ID,
  QUOTE_LINE_ID,
  REQUEST_ID,
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
    usePutQuoteLineSelectionMutation: vi.fn(),
    useDeleteQuoteLineSelectionMutation: vi.fn(),
    useRejectQuoteLineMutation: vi.fn(),
    useUnrejectQuoteLineMutation: vi.fn(),
  };
});

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUsePutQuoteLineSelectionMutation = vi.mocked(
  usePutQuoteLineSelectionMutation,
);
const mockedUseDeleteQuoteLineSelectionMutation = vi.mocked(
  useDeleteQuoteLineSelectionMutation,
);
const mockedUseRejectQuoteLineMutation = vi.mocked(useRejectQuoteLineMutation);
const mockedUseUnrejectQuoteLineMutation = vi.mocked(
  useUnrejectQuoteLineMutation,
);

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

const idleMutation = [
  vi.fn(),
  { isLoading: false, error: undefined, reset: vi.fn() },
] as const;

describe('QuoteOfferDecisionCell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockManageQuotes();
    mockedUsePutQuoteLineSelectionMutation.mockReturnValue(
      idleMutation as unknown as ReturnType<
        typeof usePutQuoteLineSelectionMutation
      >,
    );
    mockedUseDeleteQuoteLineSelectionMutation.mockReturnValue(
      idleMutation as unknown as ReturnType<
        typeof useDeleteQuoteLineSelectionMutation
      >,
    );
    mockedUseRejectQuoteLineMutation.mockReturnValue(
      idleMutation as unknown as ReturnType<typeof useRejectQuoteLineMutation>,
    );
    mockedUseUnrejectQuoteLineMutation.mockReturnValue(
      idleMutation as unknown as ReturnType<
        typeof useUnrejectQuoteLineMutation
      >,
    );
  });

  it('shows select and reject icons when neutral and enabled', () => {
    renderWithProviders(
      <QuoteOfferDecisionCell
        companyId={COMPANY_ID}
        quoteId={QUOTE_ID}
        lineId={QUOTE_LINE_ID}
        maxQuantity="100"
        selectedQuantity={null}
        rejectedAt={null}
        materialRequestId={REQUEST_ID}
        selectionEnabled
        allowReject
      />,
      { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
    );

    expect(
      screen.getByRole('button', { name: 'Select offer' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reject offer' }),
    ).toBeInTheDocument();
  });

  it('shows qty and edit without reject when selected', () => {
    renderWithProviders(
      <QuoteOfferDecisionCell
        companyId={COMPANY_ID}
        quoteId={QUOTE_ID}
        lineId={QUOTE_LINE_ID}
        maxQuantity="100"
        selectedQuantity="40"
        rejectedAt={null}
        unit="pcs"
        materialRequestId={REQUEST_ID}
        selectionEnabled
        allowReject
      />,
      { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
    );

    expect(screen.getByText('40 pcs')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Edit selection' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Reject offer' }),
    ).not.toBeInTheDocument();
  });

  it('shows rejected badge and undo edit for buyer', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <QuoteOfferDecisionCell
        companyId={COMPANY_ID}
        quoteId={QUOTE_ID}
        lineId={QUOTE_LINE_ID}
        maxQuantity="100"
        selectedQuantity={null}
        rejectedAt="2026-07-15T10:00:00.000Z"
        rejectionReason="Too expensive"
        materialRequestId={REQUEST_ID}
        selectionEnabled
        allowReject
      />,
      { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
    );

    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Select offer' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Undo reject' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Clear the rejection for this offer?')).toBeInTheDocument();
  });

  it('hides decision icons when selection and reject are disabled', () => {
    renderWithProviders(
      <QuoteOfferDecisionCell
        companyId={COMPANY_ID}
        quoteId={QUOTE_ID}
        lineId={QUOTE_LINE_ID}
        maxQuantity="100"
        selectedQuantity={null}
        rejectedAt={null}
        materialRequestId={REQUEST_ID}
        selectionEnabled={false}
        allowReject={false}
      />,
      { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
    );

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Select offer' }),
    ).not.toBeInTheDocument();
  });
});
