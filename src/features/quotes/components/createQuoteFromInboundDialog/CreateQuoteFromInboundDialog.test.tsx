import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import type { ComponentProps } from 'react';

import {
  useCreateQuoteMutation,
  useLazyListQuotesQuery,
} from '@/api/endpoints/quotesApi';
import { useListInboundRequestsQuery } from '@/api/endpoints/requestsApi';
import { CreateQuoteFromInboundDialog } from '@/features/quotes/components/createQuoteFromInboundDialog/CreateQuoteFromInboundDialog';
import {
  COMPANY_ID,
  QUOTE_ID,
  REQUEST_ID,
  createInboundMaterialRequestSummary,
  createSupplierQuoteSummary,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/quotesApi', () => ({
  useCreateQuoteMutation: vi.fn(),
  useLazyListQuotesQuery: vi.fn(),
}));

vi.mock('@/api/endpoints/requestsApi', () => ({
  useListInboundRequestsQuery: vi.fn(),
}));

const mockedUseCreateQuoteMutation = vi.mocked(useCreateQuoteMutation);
const mockedUseLazyListQuotesQuery = vi.mocked(useLazyListQuotesQuery);
const mockedUseListInboundRequestsQuery = vi.mocked(
  useListInboundRequestsQuery,
);

function mockMutationHook(mock: ReturnType<typeof vi.fn>) {
  return [mock, { isLoading: false, error: undefined, reset: vi.fn() }] as const;
}

describe('CreateQuoteFromInboundDialog', () => {
  const createQuote = vi.fn();
  const listQuotes = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    createQuote.mockReturnValue({
      unwrap: () => Promise.resolve({ quote: { id: QUOTE_ID } }),
    });
    listQuotes.mockReturnValue({
      unwrap: () => Promise.resolve({ quotes: [] }),
    });

    mockedUseCreateQuoteMutation.mockReturnValue(
      mockMutationHook(createQuote) as ReturnType<typeof useCreateQuoteMutation>,
    );
    mockedUseLazyListQuotesQuery.mockReturnValue([
      listQuotes,
      { isLoading: false, reset: vi.fn() },
    ] as unknown as ReturnType<typeof useLazyListQuotesQuery>);
    mockedUseListInboundRequestsQuery.mockReturnValue({
      data: {
        requests: [
          createInboundMaterialRequestSummary({ title: 'Steel parts RFQ' }),
        ],
        pagination: { total: 1, limit: 100, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListInboundRequestsQuery>);
  });

  function renderDialog(
    props: Partial<ComponentProps<typeof CreateQuoteFromInboundDialog>> = {},
  ) {
    return renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <CreateQuoteFromInboundDialog
              open
              onClose={vi.fn()}
              companyId={COMPANY_ID}
              {...props}
            />
          }
        />
        <Route path="/app/quotes/:quoteId" element={<div>Quote detail</div>} />
      </Routes>,
    );
  }

  it('creates a draft quote with required number and currency', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByLabelText('Incoming request'));
    await user.click(
      await screen.findByRole('option', { name: /Steel parts RFQ/ }),
    );
    await user.type(
      await screen.findByRole('textbox', { name: /Quote number/ }),
      'Q-100',
    );
    await user.click(screen.getByRole('combobox', { name: 'Currency' }));
    await user.click(screen.getByRole('option', { name: 'RMB' }));
    await user.click(screen.getByRole('button', { name: 'Create quote' }));

    await waitFor(() => {
      expect(createQuote).toHaveBeenCalledWith({
        companyId: COMPANY_ID,
        requestId: REQUEST_ID,
        number: 'Q-100',
        currency: 'RMB',
        submitOnCreate: false,
      });
    });
    expect(await screen.findByText('Quote detail')).toBeInTheDocument();
  });

  it('submits immediately when the checkbox is checked', async () => {
    const user = userEvent.setup();
    renderDialog({
      lockedRequest: {
        id: REQUEST_ID,
        title: 'Steel parts RFQ',
        buyerName: 'Buyer Corp',
      },
    });

    expect(
      screen.queryByPlaceholderText('Search by title or buyer'),
    ).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Steel parts RFQ · Buyer Corp')).toBeInTheDocument();

    await user.type(
      await screen.findByRole('textbox', { name: /Quote number/ }),
      'Q-200',
    );
    await user.click(screen.getByRole('combobox', { name: 'Currency' }));
    await user.click(screen.getByRole('option', { name: 'USD' }));
    await user.click(screen.getByLabelText('Submit immediately'));
    await user.click(screen.getByRole('button', { name: 'Create quote' }));

    await waitFor(() => {
      expect(createQuote).toHaveBeenCalledWith(
        expect.objectContaining({
          number: 'Q-200',
          currency: 'USD',
          submitOnCreate: true,
        }),
      );
    });
  });

  it('keeps create disabled until number and currency are set', async () => {
    renderDialog({
      lockedRequest: { id: REQUEST_ID, title: 'Steel parts RFQ' },
    });

    expect(
      await screen.findByRole('textbox', { name: /Quote number/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create quote' })).toBeDisabled();
  });

  it('shows a link to the existing quote instead of creating another', async () => {
    const user = userEvent.setup();
    listQuotes.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          quotes: [createSupplierQuoteSummary({ number: 'Q-EXIST' })],
        }),
    });

    renderDialog();

    await user.click(screen.getByLabelText('Incoming request'));
    await user.click(
      await screen.findByRole('option', { name: /Steel parts RFQ/ }),
    );

    expect(
      await screen.findByText('A quote already exists for this request.'),
    ).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Open Q-EXIST' });
    expect(link).toHaveAttribute('href', `/app/quotes/${QUOTE_ID}`);
    expect(screen.getByRole('button', { name: 'Create quote' })).toBeDisabled();
    expect(
      screen.queryByRole('textbox', { name: /Quote number/ }),
    ).not.toBeInTheDocument();
    expect(createQuote).not.toHaveBeenCalled();
  });
});
