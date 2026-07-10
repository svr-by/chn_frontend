import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useLoginMutation } from '@/api/endpoints/authApi';
import { LoginPage } from '@/features/auth/LoginPage';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useLoginMutation: vi.fn(),
  };
});

const mockedUseLoginMutation = vi.mocked(useLoginMutation);

describe('LoginPage', () => {
  it('renders sign-in form fields', () => {
    mockedUseLoginMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ]);

    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });

  it('shows validation errors for empty submit', async () => {
    mockedUseLoginMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ]);

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByLabelText('Email')).toBeInvalid();
    expect(screen.getByLabelText('Password')).toBeInvalid();
  });
});
