import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useUpdateQuoteMutation } from '@/api/endpoints/quotesApi';
import {
  QuoteCurrencyEditButton,
  QuoteNotesEditButton,
  QuoteNumberEditButton,
} from '@/features/quotes/components/quoteHeaderForm/QuoteHeaderForm';
import {
  COMPANY_ID,
  createQuoteLine,
  createSupplierQuote,
  QUOTE_ID,
  REQUEST_ID,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/quotesApi', () => ({
  useUpdateQuoteMutation: vi.fn(),
}));

const mockedUseUpdateQuoteMutation = vi.mocked(useUpdateQuoteMutation);

describe('QuoteHeaderForm edit buttons', () => {
  const updateQuote = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    updateQuote.mockReturnValue({
      unwrap: () => Promise.resolve({ quote: createSupplierQuote() }),
    });
    mockedUseUpdateQuoteMutation.mockReturnValue([
      updateQuote,
      { isLoading: false, reset: vi.fn(), error: undefined },
    ] as ReturnType<typeof useUpdateQuoteMutation>);
  });

  it('saves currency from edit dialog', async () => {
    const user = userEvent.setup();
    const quote = createSupplierQuote({ currency: 'USD' });

    renderWithProviders(
      <QuoteCurrencyEditButton companyId={COMPANY_ID} quote={quote} />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit currency' }));
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'EUR' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(updateQuote).toHaveBeenCalledWith({
        companyId: COMPANY_ID,
        quoteId: QUOTE_ID,
        materialRequestId: REQUEST_ID,
        currency: 'EUR',
      });
    });
  });

  it('disables currency edit when quote has buyer selections', () => {
    const quote = createSupplierQuote({
      currency: 'USD',
      lines: [createQuoteLine({ selectedQuantity: '5' })],
    });

    renderWithProviders(
      <QuoteCurrencyEditButton
        companyId={COMPANY_ID}
        quote={quote}
        disabled
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Edit currency' }),
    ).toBeDisabled();
  });

  it('saves notes from edit dialog', async () => {
    const user = userEvent.setup();
    const quote = createSupplierQuote({ notes: null });

    renderWithProviders(
      <QuoteNotesEditButton companyId={COMPANY_ID} quote={quote} />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit notes' }));
    await user.type(screen.getByLabelText('Notes'), 'Updated notes');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(updateQuote).toHaveBeenCalledWith({
        companyId: COMPANY_ID,
        quoteId: QUOTE_ID,
        materialRequestId: REQUEST_ID,
        notes: 'Updated notes',
      });
    });
  });

  it('saves quote number from edit dialog', async () => {
    const user = userEvent.setup();
    const quote = createSupplierQuote({ number: null });

    renderWithProviders(
      <QuoteNumberEditButton companyId={COMPANY_ID} quote={quote} />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit quote number' }));
    await user.type(screen.getByLabelText('Quote number'), 'Q-100');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(updateQuote).toHaveBeenCalledWith({
        companyId: COMPANY_ID,
        quoteId: QUOTE_ID,
        materialRequestId: REQUEST_ID,
        number: 'Q-100',
      });
    });
  });
});
