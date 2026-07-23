import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { useLazyListDocumentCommentsQuery } from '@/api/endpoints/commentsApi';
import { DocumentCommentsPanel } from '@/features/collaboration/components/documentCommentsPanel/DocumentCommentsPanel';
import { COMPANY_ID, createComment, INVOICE_ID } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/commentsApi', () => ({
  useLazyListDocumentCommentsQuery: vi.fn(),
  useCreateDocumentCommentMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, error: undefined, reset: vi.fn() },
  ]),
}));

const mockedUseLazyListDocumentCommentsQuery = vi.mocked(
  useLazyListDocumentCommentsQuery,
);

describe('DocumentCommentsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseLazyListDocumentCommentsQuery.mockReturnValue([
      vi.fn().mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          comments: [createComment()],
          nextCursor: null,
        }),
      }),
      { isLoading: false, reset: vi.fn() },
      { lastArg: undefined },
    ] as unknown as ReturnType<typeof useLazyListDocumentCommentsQuery>);
  });

  it('renders comments and empty state helper text', async () => {
    renderWithProviders(
      <DocumentCommentsPanel
        companyId={COMPANY_ID}
        documentType="INVOICE"
        documentId={INVOICE_ID}
      />,
    );

    expect(
      await screen.findByText('Please confirm delivery date.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Post comment' }),
    ).toBeInTheDocument();
  });

  it('shows empty state when there are no comments', async () => {
    mockedUseLazyListDocumentCommentsQuery.mockReturnValue([
      vi.fn().mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          comments: [],
          nextCursor: null,
        }),
      }),
      { isLoading: false, reset: vi.fn() },
      { lastArg: undefined },
    ] as unknown as ReturnType<typeof useLazyListDocumentCommentsQuery>);

    renderWithProviders(
      <DocumentCommentsPanel
        companyId={COMPANY_ID}
        documentType="INVOICE"
        documentId={INVOICE_ID}
      />,
    );

    expect(await screen.findByText('No comments yet.')).toBeInTheDocument();
  });
});
