import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useListPartnersQuery } from '@/api/endpoints/partnersApi';
import { useDistributeRequestMutation } from '@/api/endpoints/requestsApi';
import { RequestDistributeToSupplierDialog } from '@/features/requests/components/requestSuppliersMatrix/RequestDistributeToSupplierDialog';
import {
  COMPANY_ID,
  REQUEST_ID,
  REQUEST_LINE_ID,
  createTradingPartner,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/partnersApi', () => ({
  useListPartnersQuery: vi.fn(),
}));

vi.mock('@/api/endpoints/requestsApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/api/endpoints/requestsApi')>();
  return {
    ...actual,
    useDistributeRequestMutation: vi.fn(),
  };
});

const mockedUseListPartnersQuery = vi.mocked(useListPartnersQuery);
const mockedUseDistributeRequestMutation = vi.mocked(
  useDistributeRequestMutation,
);

describe('RequestDistributeToSupplierDialog', () => {
  const distribute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    distribute.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ request: {} }),
    });

    mockedUseListPartnersQuery.mockReturnValue({
      data: { partners: [createTradingPartner({ status: 'ACTIVE' })] },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListPartnersQuery>);

    mockedUseDistributeRequestMutation.mockReturnValue([
      distribute,
      { isLoading: false, error: undefined, reset: vi.fn() },
    ] as unknown as ReturnType<typeof useDistributeRequestMutation>);
  });

  it('sends optional notifyEmail with the distribution', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <RequestDistributeToSupplierDialog
        open
        companyId={COMPANY_ID}
        requestId={REQUEST_ID}
        requestLineIds={[REQUEST_LINE_ID]}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText('Supplier'));
    await user.click(await screen.findByRole('option', { name: 'Partner Corp' }));

    await user.type(
      screen.getByLabelText('Notify employee email'),
      'buyer-contact@supplier.com',
    );
    await user.click(screen.getByRole('button', { name: 'Distribute' }));

    await waitFor(() => {
      expect(distribute).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: COMPANY_ID,
          requestId: REQUEST_ID,
          createProducts: false,
          distributions: [
            expect.objectContaining({
              requestLineIds: [REQUEST_LINE_ID],
              notifyEmail: 'buyer-contact@supplier.com',
            }),
          ],
        }),
      );
    });
  });

  it('omits notifyEmail when the field is empty', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <RequestDistributeToSupplierDialog
        open
        companyId={COMPANY_ID}
        requestId={REQUEST_ID}
        requestLineIds={[REQUEST_LINE_ID]}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText('Supplier'));
    await user.click(await screen.findByRole('option', { name: 'Partner Corp' }));
    await user.click(screen.getByRole('button', { name: 'Distribute' }));

    await waitFor(() => {
      expect(distribute).toHaveBeenCalled();
    });

    const body = distribute.mock.calls[0]?.[0] as {
      distributions: Array<{ notifyEmail?: string }>;
    };
    expect(body.distributions[0]).not.toHaveProperty('notifyEmail');
  });
});
