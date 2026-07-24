import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useGetDocumentRelationshipsQuery } from '@/api/endpoints/traceApi';
import { DocumentRelatedPanel } from '@/features/trace/components/DocumentRelatedPanel';
import {
  COMPANY_ID,
  createDocumentRelationships,
  INVOICE_ID,
  REQUEST_ID,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/traceApi', () => ({
  useGetDocumentRelationshipsQuery: vi.fn(),
}));

describe('DocumentRelatedPanel', () => {
  beforeEach(() => {
    vi.mocked(useGetDocumentRelationshipsQuery).mockReturnValue({
      data: createDocumentRelationships(),
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as never);
  });

  it('renders pipeline stages, highlights current, and navigates on click', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route
          path="/app/requests/:requestId"
          element={<div>Request detail</div>}
        />
        <Route
          path="/document"
          element={
            <DocumentRelatedPanel
              companyId={COMPANY_ID}
              documentType="INVOICE"
              documentId={INVOICE_ID}
            />
          }
        />
      </Routes>,
      { route: '/document' },
    );

    expect(screen.getByText('Request')).toBeInTheDocument();
    expect(screen.getByText('Invoice')).toBeInTheDocument();
    expect(screen.getByText('Office supplies')).toBeInTheDocument();
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('Buyer Corp')).toBeInTheDocument();
    expect(screen.getByText('Supplier Corp')).toBeInTheDocument();
    expect(screen.getByText('Quoting')).toBeInTheDocument();
    expect(screen.getByText('Issued')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Office supplies' }));
    expect(screen.getByText('Request detail')).toBeInTheDocument();
  });

  it('shows empty state when graph has no nodes', () => {
    vi.mocked(useGetDocumentRelationshipsQuery).mockReturnValue({
      data: { nodes: [], edges: [] },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <DocumentRelatedPanel
        companyId={COMPANY_ID}
        documentType="MATERIAL_REQUEST"
        documentId={REQUEST_ID}
      />,
    );

    expect(screen.getByText('No related documents.')).toBeInTheDocument();
  });

  it('does not render document ids as labels', () => {
    vi.mocked(useGetDocumentRelationshipsQuery).mockReturnValue({
      data: createDocumentRelationships({
        nodes: [
          {
            id: REQUEST_ID,
            documentType: 'MATERIAL_REQUEST',
            status: 'QUOTING',
            label: REQUEST_ID,
            companyName: 'Buyer Corp',
          },
          {
            id: INVOICE_ID,
            documentType: 'INVOICE',
            status: 'ISSUED',
            label: INVOICE_ID,
            companyName: null,
          },
        ],
      }),
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <DocumentRelatedPanel
        companyId={COMPANY_ID}
        documentType="INVOICE"
        documentId={INVOICE_ID}
      />,
    );

    expect(screen.queryByText(REQUEST_ID)).not.toBeInTheDocument();
    expect(screen.queryByText(INVOICE_ID)).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Buyer Corp' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });
});
