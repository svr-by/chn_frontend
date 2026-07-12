import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DocumentDetailTabs } from '@/features/collaboration/components/DocumentDetailTabs';
import { usePermissions } from '@/hooks/usePermissions';
import {
  COMPANY_ID,
  INVOICE_ID,
  LINEAGE_ID,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: vi.fn(),
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: vi.fn(),
}));

vi.mock('@/api/endpoints/commentsApi', () => ({
  useLazyListDocumentCommentsQuery: vi.fn(() => [
    vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ comments: [], nextCursor: null }),
    }),
    { isLoading: false, reset: vi.fn() },
    { lastArg: undefined },
  ]),
  useLazyListDocumentActivityQuery: vi.fn(() => [
    vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ activity: [], nextCursor: null }),
    }),
    { isLoading: false, reset: vi.fn() },
    { lastArg: undefined },
  ]),
  useCreateDocumentCommentMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
}));

vi.mock('@/api/endpoints/traceApi', () => ({
  useGetDocumentRelationshipsQuery: vi.fn(() => ({
    data: { nodes: [], edges: [] },
    isLoading: false,
    isFetching: false,
    error: undefined,
    refetch: vi.fn(),
  })),
}));

describe('DocumentDetailTabs', () => {
  beforeEach(() => {
    vi.mocked(usePermissions).mockReturnValue({
      user: undefined,
      membership: undefined,
      permissions: ['viewTrace', 'viewInvoices'],
      isLoading: false,
      hasPermission: (required) =>
        ['viewTrace', 'viewInvoices'].includes(required as string),
      hasAnyPermission: (required) =>
        required.some((permission) =>
          ['viewTrace', 'viewInvoices'].includes(permission as string),
        ),
    });
  });

  it('shows trace and related tabs when user has viewTrace', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <DocumentDetailTabs
        companyId={COMPANY_ID}
        documentType="INVOICE"
        documentId={INVOICE_ID}
        details={<div>Invoice details</div>}
        lineageEntries={[
          {
            lineageId: LINEAGE_ID,
            description: 'Office paper',
            quantity: '10.0000',
            unit: 'pack',
          },
        ]}
      />,
      { route: '/app/invoices/1' },
    );

    expect(screen.getByRole('tab', { name: 'Trace' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Related' })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Trace' }));
    expect(screen.getByText('Office paper')).toBeInTheDocument();
    expect(screen.getByText('View full trace')).toBeInTheDocument();
  });

  it('hides trace tabs without viewTrace permission', () => {
    vi.mocked(usePermissions).mockReturnValue({
      user: undefined,
      membership: undefined,
      permissions: ['viewInvoices'],
      isLoading: false,
      hasPermission: (required) => required === 'viewInvoices',
      hasAnyPermission: (required) => required.includes('viewInvoices' as never),
    });

    renderWithProviders(
      <DocumentDetailTabs
        companyId={COMPANY_ID}
        documentType="INVOICE"
        documentId={INVOICE_ID}
        details={<div>Invoice details</div>}
      />,
    );

    expect(screen.queryByRole('tab', { name: 'Trace' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Related' })).not.toBeInTheDocument();
  });
});
