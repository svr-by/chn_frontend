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

  it('renders related nodes and navigates on click', async () => {
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

    expect(
      screen.getByRole('heading', { name: /Office supplies/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /INV-001/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('Quoting')).toBeInTheDocument();
    expect(screen.getByText('Issued')).toBeInTheDocument();

    await user.click(screen.getByRole('heading', { name: /Office supplies/ }));
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
});
