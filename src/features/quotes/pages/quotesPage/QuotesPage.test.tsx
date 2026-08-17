import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useCreateQuoteMutation,
  useLazyListQuotesQuery,
  useListQuotesQuery,
} from '@/api/endpoints/quotesApi';
import { useListPartnersQuery } from '@/api/endpoints/partnersApi';
import { useListInboundRequestsQuery } from '@/api/endpoints/requestsApi';
import { QuotesPage } from '@/features/quotes/pages/quotesPage/QuotesPage';
import {
  PREFERRED_TRADING_ROLE_STORAGE_KEY,
  readPreferredTradingRole,
  writePreferredTradingRole,
} from '@/lib/preferredDirection';
import {
  COMPANY_ID,
  createInboundMaterialRequestSummary,
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
  useLazyListQuotesQuery: vi.fn(),
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

vi.mock('@/api/endpoints/requestsApi', () => ({
  useListInboundRequestsQuery: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseListQuotesQuery = vi.mocked(useListQuotesQuery);
const mockedUseListPartnersQuery = vi.mocked(useListPartnersQuery);
const mockedUseCreateQuoteMutation = vi.mocked(useCreateQuoteMutation);
const mockedUseLazyListQuotesQuery = vi.mocked(useLazyListQuotesQuery);
const mockedUseListInboundRequestsQuery = vi.mocked(
  useListInboundRequestsQuery,
);

function mockMutationHook(mock: ReturnType<typeof vi.fn>) {
  return [mock, { isLoading: false, error: undefined, reset: vi.fn() }] as const;
}

async function openFilters(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Filters' }));
}

describe('QuotesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.removeItem(PREFERRED_TRADING_ROLE_STORAGE_KEY);

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewQuotes', 'manageQuotes'],
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

    mockedUseListInboundRequestsQuery.mockReturnValue({
      data: { requests: [], pagination: { total: 0, limit: 100, offset: 0 } },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListInboundRequestsQuery>);

    mockedUseCreateQuoteMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useCreateQuoteMutation>,
    );
    mockedUseLazyListQuotesQuery.mockReturnValue([
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ] as unknown as ReturnType<typeof useLazyListQuotesQuery>);
  });

  it('renders inbound tab by default without new quote button', async () => {
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

    expect(
      screen.queryByRole('button', { name: 'New quote' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();

    await openFilters(user);
    expect(screen.getByLabelText('Supplier')).toBeInTheDocument();
    expect(mockedUseListQuotesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'inbound' }),
      expect.anything(),
    );
  });

  it('shows new quote button on outbound tab', async () => {
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

    expect(screen.getByRole('button', { name: 'New quote' })).toBeInTheDocument();
  });

  it('opens create dialog from new quote button', async () => {
    const user = userEvent.setup();

    mockedUseListInboundRequestsQuery.mockReturnValue({
      data: {
        requests: [
          createInboundMaterialRequestSummary({
            title: 'Steel parts RFQ',
          }),
        ],
        pagination: { total: 1, limit: 100, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListInboundRequestsQuery>);

    renderWithProviders(
      <Routes>
        <Route path="/app/quotes" element={<QuotesPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/quotes?direction=outbound',
      },
    );

    await user.click(screen.getByRole('button', { name: 'New quote' }));

    expect(
      await screen.findByRole('dialog', { name: 'New quote' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Incoming request')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Quote number/ })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Currency/ })).toBeInTheDocument();
    expect(screen.getByLabelText('Submit immediately')).toBeInTheDocument();
  });

  it('opens outbound tab when preferred supplier role is stored', async () => {
    const user = userEvent.setup();
    writePreferredTradingRole('supplier');

    renderWithProviders(
      <Routes>
        <Route path="/app/quotes" element={<QuotesPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/quotes',
      },
    );

    expect(mockedUseListQuotesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'outbound' }),
      expect.anything(),
    );
    await openFilters(user);
    expect(screen.getByLabelText('Buyer')).toBeInTheDocument();
  });

  it('opens inbound tab when preferred buyer role is stored', async () => {
    const user = userEvent.setup();
    writePreferredTradingRole('buyer');

    renderWithProviders(
      <Routes>
        <Route path="/app/quotes" element={<QuotesPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/quotes',
      },
    );

    expect(mockedUseListQuotesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'inbound' }),
      expect.anything(),
    );
    await openFilters(user);
    expect(screen.getByLabelText('Supplier')).toBeInTheDocument();
  });

  it('keeps URL direction over stored preference', async () => {
    const user = userEvent.setup();
    writePreferredTradingRole('supplier');

    renderWithProviders(
      <Routes>
        <Route path="/app/quotes" element={<QuotesPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/quotes?direction=inbound',
      },
    );

    expect(mockedUseListQuotesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'inbound' }),
      expect.anything(),
    );
    await openFilters(user);
    expect(screen.getByLabelText('Supplier')).toBeInTheDocument();
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
    await openFilters(user);

    expect(await screen.findByLabelText('Buyer')).toBeInTheDocument();
    expect(mockedUseListQuotesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'outbound' }),
      expect.anything(),
    );
    expect(readPreferredTradingRole()).toBe('supplier');
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

    await openFilters(user);

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
    expect(
      within(screen.getByRole('button', { name: 'Filters' })).getByText('1'),
    ).toBeInTheDocument();
  });
});
