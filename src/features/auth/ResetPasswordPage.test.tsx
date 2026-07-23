import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useResetPasswordMutation } from '@/api/endpoints/authApi';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useResetPasswordMutation: vi.fn(),
  };
});

const mockedUseResetPasswordMutation = vi.mocked(useResetPasswordMutation);

describe('ResetPasswordPage', () => {
  it('shows missing token message without query param', () => {
    mockedUseResetPasswordMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ]);

    renderWithProviders(<ResetPasswordPage />, { route: '/reset-password' });

    expect(
      screen.getByText('Reset link is invalid or missing.'),
    ).toBeInTheDocument();
  });

  it('renders password form when token is present', () => {
    mockedUseResetPasswordMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ]);

    renderWithProviders(<ResetPasswordPage />, {
      route: '/reset-password?token=abc123',
    });

    expect(screen.getByText('Set a new password')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
  });

  it('shows mismatch error when passwords differ', async () => {
    mockedUseResetPasswordMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ]);

    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />, {
      route: '/reset-password?token=abc123',
    });

    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm password'), 'different');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });
});
