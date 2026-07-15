import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useListRequestLinesQuery } from '@/api/endpoints/requestsApi';
import { RequestLinesPage } from '@/features/requests/pages/RequestLinesPage';
import {
  COMPANY_ID,
  createRequestLineListItem,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/requestsApi', () => ({
  useListRequestLinesQuery: vi.fn(),
}));

const mockedUseListRequestLinesQuery = vi.mocked(useListRequestLinesQuery);

function renderPage(route = '/app/request-lines') {
  return renderWithProviders(
    <Routes>
      <Route path="/app/request-lines" element={<RequestLinesPage />} />
      <Route path="/app/requests/:requestId" element={<div>Request detail</div>} />
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
  });

  it('renders request lines and queries newest request lines first', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Request lines' })).toBeInTheDocument();
    expect(screen.getByText('Office paper')).toBeInTheDocument();
    expect(screen.getByText('Office supplies')).toBeInTheDocument();
    expect(screen.getByText('A4 Paper')).toBeInTheDocument();

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

  it('uses filter params from the URL', () => {
    renderPage(
      '/app/request-lines?q=paper&status=SUBMITTED&requestId=req-1&undistributed=true&withoutQuotes=true',
    );

    expect(mockedUseListRequestLinesQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        q: 'paper',
        status: 'SUBMITTED',
        requestId: 'req-1',
        undistributed: 'true',
        withoutQuotes: 'true',
      }),
      expect.objectContaining({ skip: false }),
    );
  });

  it('applies and resets drawer filters', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.type(screen.getByLabelText('Search'), 'bolt');
    await user.click(screen.getByLabelText('Only undistributed lines'));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    await waitFor(() => {
      expect(mockedUseListRequestLinesQuery).toHaveBeenLastCalledWith(
        expect.objectContaining({
          q: 'bolt',
          undistributed: 'true',
        }),
        expect.objectContaining({ skip: false }),
      );
    });

    await user.click(screen.getByRole('button', { name: 'Filters (2)' }));
    await user.click(screen.getByRole('button', { name: 'Reset' }));

    await waitFor(() => {
      expect(mockedUseListRequestLinesQuery).toHaveBeenLastCalledWith(
        expect.not.objectContaining({
          q: expect.anything(),
          undistributed: expect.anything(),
        }),
        expect.objectContaining({ skip: false }),
      );
    });
  });

  it('opens the parent request when a row is clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Office paper'));

    expect(await screen.findByText('Request detail')).toBeInTheDocument();
  });
});
