import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { useLogoutMutation } from '@/api/endpoints/authApi';
import { authStorage } from '@/lib/authStorage';
import { useLogout } from '@/hooks/useLogout';
import { createTestStore } from '@/test/render';

const navigateMock = vi.fn();
const logoutMutationMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useLogoutMutation: vi.fn(),
  };
});

vi.mock('@/lib/authStorage', () => ({
  authStorage: {
    getRefreshToken: vi.fn(),
    clearAll: vi.fn(),
    getAccessToken: vi.fn(),
    getActiveCompanyId: vi.fn(),
    setAccessToken: vi.fn(),
    setRefreshToken: vi.fn(),
    setActiveCompanyId: vi.fn(),
    clearAccessToken: vi.fn(),
    clearRefreshToken: vi.fn(),
    clearActiveCompanyId: vi.fn(),
  },
}));

const mockedUseLogoutMutation = vi.mocked(useLogoutMutation);
const mockedGetRefreshToken = vi.mocked(authStorage.getRefreshToken);

function wrapper({ children }: { children: ReactNode }) {
  const store = createTestStore({
    auth: { activeCompanyId: null, isBootstrapped: true },
  });

  return (
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  );
}

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logoutMutationMock.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue(undefined),
    });
    mockedUseLogoutMutation.mockReturnValue([
      logoutMutationMock,
      { isLoading: false, reset: vi.fn() },
    ]);
    mockedGetRefreshToken.mockReturnValue('refresh-token');
  });

  it('calls logout API and navigates to login', async () => {
    const { result } = renderHook(() => useLogout(), { wrapper });

    await result.current.logout();

    expect(logoutMutationMock).toHaveBeenCalledWith({
      refreshToken: 'refresh-token',
    });
    expect(navigateMock).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('navigates to login even when logout API fails', async () => {
    logoutMutationMock.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error('network')),
    });

    const { result } = renderHook(() => useLogout(), { wrapper });

    await result.current.logout();

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  it('skips API call when refresh token is missing', async () => {
    mockedGetRefreshToken.mockReturnValue(null);

    const { result } = renderHook(() => useLogout(), { wrapper });

    await result.current.logout();

    expect(logoutMutationMock).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/login', { replace: true });
  });
});
