import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  useAppHistoryTracker,
  useSafeAppBack,
} from '@/hooks/useSafeAppBack';

const APP_HISTORY_KEY = 'chn.appHistory';

function seedHistory(entries: Array<{ key: string; path: string }>) {
  window.sessionStorage.setItem(APP_HISTORY_KEY, JSON.stringify(entries));
}

function readHistory() {
  return JSON.parse(
    window.sessionStorage.getItem(APP_HISTORY_KEY) ?? '[]',
  ) as Array<{ key: string; path: string }>;
}

function BackButton({ fallback }: { fallback: string }) {
  const handleBack = useSafeAppBack(fallback);
  const location = useLocation();

  return (
    <div>
      <span data-testid="path">
        {location.pathname}
        {location.search}
      </span>
      <button type="button" onClick={handleBack}>
        Back
      </button>
    </div>
  );
}

function HistoryTrackerHarness() {
  useAppHistoryTracker();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      <span data-testid="path">
        {location.pathname}
        {location.search}
      </span>
      <button
        type="button"
        onClick={() =>
          navigate({
            pathname: location.pathname,
            search: '?tab=comments',
          })
        }
      >
        Open comments tab
      </button>
    </div>
  );
}

function renderWithRouter(
  ui: ReactNode,
  initialEntry = '/app/invoices/123?tab=comments',
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('useSafeAppBack', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('skips tab-only history entries when navigating back', async () => {
    const user = userEvent.setup();

    seedHistory([
      { key: 'list', path: '/app/invoices' },
      { key: 'detail', path: '/app/invoices/123' },
      { key: 'detail-tab', path: '/app/invoices/123?tab=comments' },
    ]);

    renderWithRouter(<BackButton fallback="/app/invoices" />);

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByTestId('path')).toHaveTextContent('/app/invoices');
  });

  it('preserves query params when returning to a different pathname', async () => {
    const user = userEvent.setup();

    seedHistory([
      { key: 'inbound-list', path: '/app/requests?tab=inbound' },
      { key: 'detail', path: '/app/requests/abc' },
    ]);

    renderWithRouter(
      <BackButton fallback="/app/requests" />,
      '/app/requests/abc',
    );

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByTestId('path')).toHaveTextContent(
      '/app/requests?tab=inbound',
    );
  });
});

describe('useAppHistoryTracker', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('updates the last entry instead of pushing when only query params change', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/app/invoices/123']}>
        <Routes>
          <Route path="*" element={<HistoryTrackerHarness />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(readHistory()).toEqual([
      { key: 'default', path: '/app/invoices/123' },
    ]);

    await user.click(
      screen.getByRole('button', { name: 'Open comments tab' }),
    );

    expect(screen.getByTestId('path')).toHaveTextContent(
      '/app/invoices/123?tab=comments',
    );
    expect(readHistory()).toHaveLength(1);
    expect(readHistory()[0]?.path).toBe('/app/invoices/123?tab=comments');
  });
});
