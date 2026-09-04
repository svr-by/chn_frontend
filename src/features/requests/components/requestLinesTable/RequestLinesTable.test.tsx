import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { RequestLinesTable } from '@/features/requests/components/requestLinesTable/RequestLinesTable';
import {
  COMPANY_ID,
  REQUEST_ID,
  createRequestDetailLine,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/requestsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/endpoints/requestsApi')>();
  return {
    ...actual,
    useDeleteRequestLineMutation: vi.fn(() => [
      vi.fn(),
      { isLoading: false, error: undefined },
    ]),
    useAddRequestLineMutation: vi.fn(() => [
      vi.fn(),
      { isLoading: false, error: undefined, reset: vi.fn() },
    ]),
    useUpdateRequestLineMutation: vi.fn(() => [
      vi.fn(),
      { isLoading: false, error: undefined, reset: vi.fn() },
    ]),
  };
});

describe('RequestLinesTable', () => {
  it('shows cancelled badge for soft-cancelled request lines', () => {
    const activeLine = createRequestDetailLine({
      description: 'Active bolt',
    });
    const cancelledLine = createRequestDetailLine({
      id: '00000000-0000-0000-0000-000000000099',
      lineNumber: 2,
      description: 'Cancelled bolt',
      cancelledAt: '2026-07-15T10:00:00.000Z',
    });

    renderWithProviders(
      <RequestLinesTable
        companyId={COMPANY_ID}
        requestId={REQUEST_ID}
        lines={[activeLine, cancelledLine]}
        editable
      />,
    );

    expect(screen.getByText('Cancelled on request')).toBeInTheDocument();
    expect(screen.getByText('Cancelled bolt')).toBeInTheDocument();
    expect(screen.getByText('Active bolt')).toBeInTheDocument();
  });

  it('shows selected quantity column for buyer view', () => {
    renderWithProviders(
      <RequestLinesTable
        companyId={COMPANY_ID}
        requestId={REQUEST_ID}
        lines={[
          createRequestDetailLine({
            description: 'Bolt',
            quantity: '10',
            selectedQuantity: '4',
          }),
        ]}
        editable={false}
        showSelectedQuantity
      />,
    );

    expect(
      screen.getByRole('columnheader', { name: 'Selected qty' }),
    ).toBeInTheDocument();
    expect(screen.getByText('4 pcs')).toBeInTheDocument();
  });

  it('hides selected quantity column for seller view', () => {
    renderWithProviders(
      <RequestLinesTable
        companyId={COMPANY_ID}
        requestId={REQUEST_ID}
        lines={[
          createRequestDetailLine({
            description: 'Bolt',
            quantity: '10',
            selectedQuantity: '4',
          }),
        ]}
        editable={false}
      />,
    );

    expect(
      screen.queryByRole('columnheader', { name: 'Selected qty' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('4 pcs')).not.toBeInTheDocument();
  });
});
