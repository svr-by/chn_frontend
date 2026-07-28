import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useListQuotesQuery } from '@/api/endpoints/quotesApi';
import { useListPartnersQuery } from '@/api/endpoints/partnersApi';
import { QuotesPage } from '@/features/quotes/pages/quotesPage/QuotesPage';
import {
  COMPANY_ID,
  createMembership,
  createSupplierQuoteSummary,
  createTradingPartner,
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

vi.mock('@/api/endpoints/quotesApi', () => ({
  useListQuotesQuery: vi.fn(),
  useGetQuoteQuery: vi.fn(),
  useCreateQuoteMutation: vi.fn(),
  useUpdateQuoteMutation: vi.fn(),
  useAddQuoteLineMutation: vi.fn(),
  useUpdateQuoteLineMutation: vi.fn(),
  useDeleteQuoteLineMutation: vi.fn(),
  useSubmitQuoteMutation: vi.fn(),
}));

vi.mock('@/api/endpoints/partnersApi', () => ({
  useListPartnersQuery: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseListQuotesQuery = vi.mocked(useListQuotesQuery);
const mockedUseListPartnersQuery = vi.mocked(useListPartnersQuery);

describe('QuotesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewQuotes'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    mockedUseListQuotesQuery.mockReturnValue({
      data: {
        quotes: [createSupplierQuoteSummary()],
        pagination: { total: 1, limit: 20, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListQuotesQuery>);

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
        <Route path="/app/quotes" element={<QuotesPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/quotes',
      },
    );

    expect(screen.getByLabelText('Supplier')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(mockedUseListQuotesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'inbound' }),
      expect.anything(),
    );
  });

  it('switches to outbound tab', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/app/quotes" element={<QuotesPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/quotes',
      },
    );

    await user.click(screen.getByRole('tab', { name: 'Outbound' }));

    expect(await screen.findByLabelText('Buyer')).toBeInTheDocument();
    expect(mockedUseListQuotesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'outbound' }),
      expect.anything(),
    );
  });

  it('applies status filter only after Apply', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/app/quotes" element={<QuotesPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/quotes',
      },
    );

    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();

    await user.click(screen.getByLabelText('Status'));
    await user.click(await screen.findByRole('option', { name: 'Submitted' }));

    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled();
    expect(mockedUseListQuotesQuery).not.toHaveBeenCalledWith(
      expect.objectContaining({ status: 'SUBMITTED' }),
      expect.anything(),
    );

    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockedUseListQuotesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'SUBMITTED' }),
      expect.anything(),
    );
  });
});
