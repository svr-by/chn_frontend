import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useGetLineageTraceQuery } from '@/api/endpoints/traceApi';
import { TraceDetailPage } from '@/features/trace/pages/traceDetailPage/TraceDetailPage';
import {
  COMPANY_ID,
  createLineageTrace,
  createMembership,
  createTestUser,
  LINEAGE_ID,
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

vi.mock('@/api/endpoints/traceApi', () => ({
  useGetLineageTraceQuery: vi.fn(),
  useLazyGetLineageEventsQuery: vi.fn(() => [
    vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ events: [], nextCursor: null }),
    }),
    { isLoading: false, reset: vi.fn() },
    { lastArg: undefined },
  ]),
}));

const mockEnqueueSnackbar = vi.fn();
vi.mock('notistack', async (importOriginal) => {
  const actual = await importOriginal<typeof import('notistack')>();
  return {
    ...actual,
    useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar }),
  };
});

describe('TraceDetailPage', () => {
  beforeEach(() => {
    mockEnqueueSnackbar.mockReset();
    vi.mocked(useGetMeQuery).mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewTrace'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as never);
  });

  it('renders lineage pipeline when trace is found', () => {
    vi.mocked(useGetLineageTraceQuery).mockReturnValue({
      data: createLineageTrace(),
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route path="/app/trace/:lineageId" element={<TraceDetailPage />} />
      </Routes>,
      {
        preloadedState: {
          auth: {
            activeCompanyId: COMPANY_ID,
          } as never,
        },
        route: `/app/trace/${LINEAGE_ID}`,
      },
    );

    expect(screen.getByText('Lineage trace')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Graph' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Events' })).toBeInTheDocument();
    expect(screen.getAllByText('Office paper').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Supplier Ltd/).length).toBeGreaterThan(0);
  });

  it('shows events panel when events tab is selected', async () => {
    const user = userEvent.setup();
    vi.mocked(useGetLineageTraceQuery).mockReturnValue({
      data: createLineageTrace(),
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route path="/app/trace/:lineageId" element={<TraceDetailPage />} />
      </Routes>,
      {
        preloadedState: {
          auth: {
            activeCompanyId: COMPANY_ID,
          } as never,
        },
        route: `/app/trace/${LINEAGE_ID}`,
      },
    );

    await user.click(screen.getByRole('tab', { name: 'Events' }));

    expect(
      await screen.findByText('No audit events for this lineage.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Supplier Ltd')).not.toBeInTheDocument();
  });

  it('redirects to search on 404', async () => {
    vi.mocked(useGetLineageTraceQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { status: 404 },
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route path="/app/trace" element={<div>Search page</div>} />
        <Route path="/app/trace/:lineageId" element={<TraceDetailPage />} />
      </Routes>,
      {
        preloadedState: {
          auth: {
            activeCompanyId: COMPANY_ID,
          } as never,
        },
        route: `/app/trace/${LINEAGE_ID}`,
      },
    );

    await waitFor(() => {
      expect(screen.getByText('Search page')).toBeInTheDocument();
    });
    expect(mockEnqueueSnackbar).toHaveBeenCalled();
  });
});
