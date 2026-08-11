import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import {
  useListInboundRequestLinesQuery,
  useListRequestLinesQuery,
} from '@/api/endpoints/requestsApi';
import { useListMembersQuery } from '@/api/endpoints/membersApi';
import { RequestLinesPage } from '@/features/requests/pages/requestLinesPage/RequestLinesPage';
import { COMPANY_ID, createRequestLineListItem } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/requestsApi', () => ({
  useListRequestLinesQuery: vi.fn(),
  useListInboundRequestLinesQuery: vi.fn(),
}));

vi.mock('@/api/endpoints/membersApi', () => ({
  useListMembersQuery: vi.fn(),
}));

const mockedUseListRequestLinesQuery = vi.mocked(useListRequestLinesQuery);
const mockedUseListInboundRequestLinesQuery = vi.mocked(
  useListInboundRequestLinesQuery,
);
const mockedUseListMembersQuery = vi.mocked(useListMembersQuery);

function renderPage(route = '/app/request-lines') {
  return renderWithProviders(
    <Routes>
      <Route path="/app/request-lines" element={<RequestLinesPage />} />
      <Route
        path="/app/requests/:requestId"
        element={<div>Request detail</div>}
      />
    </Routes>,
    {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      route,
    },
  );
}

describe('RequestLinesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseListRequestLinesQuery.mockReturnValue({
      data: {
        items: [createRequestLineListItem()],
        pagination: { total: 1, limit: 20, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListRequestLinesQuery>);
    mockedUseListInboundRequestLinesQuery.mockReturnValue({
      data: {
        items: [],
        pagination: { total: 0, limit: 20, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListInboundRequestLinesQuery>);
    mockedUseListMembersQuery.mockReturnValue({
      data: { members: [], pagination: { total: 0, limit: 50, offset: 0 } },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListMembersQuery>);
  });

  it('renders request lines and queries newest request lines first', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Request lines' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Office paper')).toBeInTheDocument();
    expect(screen.getByText('Office supplies')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();

    expect(mockedUseListRequestLinesQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: COMPANY_ID,
        limit: 20,
        offset: 0,
        sortBy: 'requestCreatedAt',
        sortOrder: 'desc',
      }),
      expect.objectContaining({ skip: false }),
    );
  });

  it('opens the parent request when a row is clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Office paper'));

    expect(await screen.findByText('Request detail')).toBeInTheDocument();
  });
});
