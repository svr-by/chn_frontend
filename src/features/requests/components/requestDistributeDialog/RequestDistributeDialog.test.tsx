import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useListPartnersQuery } from '@/api/endpoints/partnersApi';
import { useDistributeRequestMutation } from '@/api/endpoints/requestsApi';
import { RequestDistributeDialog } from '@/features/requests/components/requestDistributeDialog/RequestDistributeDialog';
import {
  COMPANY_ID,
  createRequestLine,
  createTradingPartner,
  PARTNER_COMPANY_ID,
  REQUEST_ID,
  REQUEST_LINE_ID,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/partnersApi', () => ({
  useListPartnersQuery: vi.fn(),
}));

vi.mock('@/api/endpoints/requestsApi', () => ({
  useDistributeRequestMutation: vi.fn(),
}));

const mockedUseListPartnersQuery = vi.mocked(useListPartnersQuery);
const mockedUseDistributeRequestMutation = vi.mocked(
  useDistributeRequestMutation,
);

describe('RequestDistributeDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseListPartnersQuery.mockReturnValue({
      data: {
        partners: [
          createTradingPartner({
            status: 'ACTIVE',
            company: {
              id: PARTNER_COMPANY_ID,
              name: 'Partner Corp',
              taxId: 'TAX-123',
              country: 'US',
            },
          }),
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListPartnersQuery>);
  });

  it('submits the new distributions body with assigned line ids', async () => {
    const user = userEvent.setup();
    const distribute = vi.fn().mockReturnValue({
      unwrap: () => Promise.resolve({ request: null }),
    });

    mockedUseDistributeRequestMutation.mockReturnValue([
      distribute,
      { isLoading: false, reset: vi.fn() },
    ] as ReturnType<typeof useDistributeRequestMutation>);

    renderWithProviders(
      <RequestDistributeDialog
        open
        companyId={COMPANY_ID}
        requestId={REQUEST_ID}
        requestLines={[createRequestLine()]}
        onClose={vi.fn()}
      />,
      { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
    );

    await user.click(screen.getByLabelText('Partner Corp'));
    await user.click(screen.getByRole('button', { name: 'Distribute' }));

    await waitFor(() => {
      expect(distribute).toHaveBeenCalledWith({
        companyId: COMPANY_ID,
        requestId: REQUEST_ID,
        createProducts: false,
        distributions: [
          {
            supplierCompanyId: PARTNER_COMPANY_ID,
            requestLineIds: [REQUEST_LINE_ID],
          },
        ],
      });
    });
  });
});
