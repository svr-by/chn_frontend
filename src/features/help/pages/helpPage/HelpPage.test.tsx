import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { HelpPage } from '@/features/help/pages/helpPage/HelpPage';
import { COMPANY_ID, createMembership, createTestUser } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';
import type { Permission } from '@/types/api';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/lib/authStorage', () => ({
  authStorage: {
    getRefreshToken: vi.fn(() => 'refresh-token'),
    getAccessToken: vi.fn(() => 'access-token'),
    getActiveCompanyId: vi.fn(() => '00000000-0000-0000-0000-000000000010'),
    setActiveCompanyId: vi.fn(),
    clearActiveCompanyId: vi.fn(),
    setAccessToken: vi.fn(),
    setRefreshToken: vi.fn(),
    clearAll: vi.fn(),
  },
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);

const ALL_HELP_PERMISSIONS: Permission[] = [
  'viewMembers',
  'viewPartners',
  'viewRequests',
  'viewQuotes',
  'viewInvoices',
];

function mockMe(permissions: Permission[]) {
  mockedUseGetMeQuery.mockReturnValue({
    data: {
      user: createTestUser({
        memberships: [
          createMembership({
            effectivePermissions: permissions,
          }),
        ],
      }),
    },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  } as ReturnType<typeof useGetMeQuery>);
}

const authState = {
  auth: {
    activeCompanyId: COMPANY_ID,
    isBootstrapped: true,
  },
};

describe('HelpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the help title and overview article', () => {
    mockMe(['viewRequests']);

    renderWithProviders(<HelpPage />, {
      route: '/app/help',
      preloadedState: authState,
    });

    expect(
      screen.getByRole('heading', { name: 'How CHN works' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText(/Step 3 · Requests/)).toBeInTheDocument();
  });

  it('lists Team before Partners when both are visible', () => {
    mockMe(ALL_HELP_PERMISSIONS);

    renderWithProviders(<HelpPage />, {
      route: '/app/help',
      preloadedState: authState,
    });

    const team = screen.getByRole('button', { name: /Step 1 · Team/i });
    const partners = screen.getByRole('button', { name: /Step 2 · Partners/i });
    expect(
      team.compareDocumentPosition(partners) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('shows only articles allowed by permissions', () => {
    mockMe(['viewRequests']);

    renderWithProviders(<HelpPage />, {
      route: '/app/help',
      preloadedState: authState,
    });

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText(/Step 3 · Requests/)).toBeInTheDocument();
    expect(screen.queryByText(/Quotes/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Invoices/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Partners/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Team/)).not.toBeInTheDocument();
  });

  it('hides Next when the canonical next article is not visible', () => {
    mockMe(['viewRequests']);

    renderWithProviders(<HelpPage />, {
      route: '/app/help',
      preloadedState: authState,
    });

    expect(screen.queryByRole('button', { name: /Next:/i })).not.toBeInTheDocument();
  });

  it('links the requests CTA to /app/requests', async () => {
    const user = userEvent.setup();
    mockMe(['viewRequests']);

    renderWithProviders(
      <Routes>
        <Route path="/app/help" element={<HelpPage />} />
        <Route path="/app/requests" element={<div>Requests page</div>} />
      </Routes>,
      {
        route: '/app/help',
        preloadedState: authState,
      },
    );

    await user.click(screen.getByRole('button', { name: /Requests/i }));
    const requestsPanel = screen.getByRole('region', { name: /Requests/i });
    const cta = within(requestsPanel).getByRole('link', {
      name: 'Open Requests',
    });
    expect(cta).toHaveAttribute('href', '/app/requests');
  });

  it('expands Requests when Next is clicked on Partners', async () => {
    const user = userEvent.setup();
    mockMe(ALL_HELP_PERMISSIONS);

    renderWithProviders(<HelpPage />, {
      route: '/app/help',
      preloadedState: authState,
    });

    await user.click(screen.getByRole('button', { name: /Step 2 · Partners/i }));
    const partnersPanel = screen.getByRole('region', { name: /Partners/i });
    await user.click(
      within(partnersPanel).getByRole('button', { name: 'Next: Requests' }),
    );

    const requestsButton = screen.getByRole('button', {
      name: /Step 3 · Requests/i,
    });
    expect(requestsButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('expands the article matching the location hash', () => {
    mockMe(['viewRequests', 'viewQuotes']);

    renderWithProviders(<HelpPage />, {
      route: '/app/help#quotes',
      preloadedState: authState,
    });

    const quotesButton = screen.getByRole('button', { name: /Quotes/i });
    expect(quotesButton).toHaveAttribute('aria-expanded', 'true');
  });
});
