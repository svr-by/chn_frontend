import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useSearchTraceQuery } from '@/api/endpoints/traceApi';
import { TraceSearchPage } from '@/features/trace/pages/traceSearchPage/TraceSearchPage';
import {
  COMPANY_ID,
  createMembership,
  createTestUser,
  createTraceSearchItem,
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
  useSearchTraceQuery: vi.fn(),
}));

describe('TraceSearchPage', () => {
  beforeEach(() => {
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

    vi.mocked(useSearchTraceQuery).mockReturnValue({
      data: {
        items: [createTraceSearchItem()],
        pagination: { total: 1, limit: 20, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as never);
  });

  it('renders search results and navigates on row click', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/app/trace" element={<TraceSearchPage />} />
        <Route path="/app/trace/:lineageId" element={<div>Trace detail</div>} />
      </Routes>,
      {
        preloadedState: {
          auth: {
            activeCompanyId: COMPANY_ID,
          } as never,
        },
        route: '/app/trace',
      },
    );

    expect(screen.getByText('Traceability')).toBeInTheDocument();
    expect(screen.getByText('Office paper')).toBeInTheDocument();

    await user.click(screen.getByText('Office paper'));
    expect(screen.getByText('Trace detail')).toBeInTheDocument();
    expect(screen.queryByText('Traceability')).not.toBeInTheDocument();
  });
});
