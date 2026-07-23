import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useGetPaymentQuery } from '@/api/endpoints/paymentsApi';
import { PaymentDetailPage } from '@/features/payments/pages/PaymentDetailPage';
import {
  COMPANY_ID,
  createMembership,
  createPayment,
  createTestUser,
  PAYMENT_ID,
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

vi.mock('@/api/endpoints/paymentsApi', () => ({
  useGetPaymentQuery: vi.fn(),
  useUploadPaymentProofMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useConfirmPaymentMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useRejectPaymentMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseGetPaymentQuery = vi.mocked(useGetPaymentQuery);

describe('PaymentDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows upload section for PENDING payment', () => {
    mockedUseGetPaymentQuery.mockReturnValue({
      data: { payment: createPayment({ status: 'PENDING' }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetPaymentQuery>);

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewPayments', 'managePayments'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderWithProviders(
      <Routes>
        <Route
          path="/app/payments/:paymentId"
          element={<PaymentDetailPage />}
        />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: `/app/payments/${PAYMENT_ID}`,
      },
    );

    expect(screen.getByText('Upload payment proof')).toBeInTheDocument();
  });

  it('shows confirm and reject for UPLOADED payment with confirmPayments', () => {
    mockedUseGetPaymentQuery.mockReturnValue({
      data: {
        payment: createPayment({
          status: 'UPLOADED',
          uploadedAt: '2026-01-02T00:00:00.000Z',
          fileName: 'proof.pdf',
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetPaymentQuery>);

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewPayments', 'confirmPayments'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderWithProviders(
      <Routes>
        <Route
          path="/app/payments/:paymentId"
          element={<PaymentDetailPage />}
        />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: `/app/payments/${PAYMENT_ID}`,
      },
    );

    expect(screen.getByText('Confirm payment')).toBeInTheDocument();
    expect(screen.getByText('Reject payment')).toBeInTheDocument();
  });
});
