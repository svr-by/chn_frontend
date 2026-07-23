import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useCreateDocumentCommentMutation } from '@/api/endpoints/commentsApi';
import { CommentForm } from '@/features/collaboration/components/commentForm/CommentForm';
import { COMPANY_ID, INVOICE_ID } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/commentsApi', () => ({
  useCreateDocumentCommentMutation: vi.fn(),
}));

const mockedUseCreateDocumentCommentMutation = vi.mocked(
  useCreateDocumentCommentMutation,
);

describe('CommentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseCreateDocumentCommentMutation.mockReturnValue([
      vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) }),
      { isLoading: false, error: undefined, reset: vi.fn() },
    ] as ReturnType<typeof useCreateDocumentCommentMutation>);
  });

  it('shows validation error for empty comment', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <CommentForm
        companyId={COMPANY_ID}
        documentType="INVOICE"
        documentId={INVOICE_ID}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Post comment' }));

    expect(
      await screen.findByText('Comment cannot be empty'),
    ).toBeInTheDocument();
  });

  it('submits trimmed comment body', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const createComment = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });
    mockedUseCreateDocumentCommentMutation.mockReturnValue([
      createComment,
      { isLoading: false, error: undefined, reset: vi.fn() },
    ] as ReturnType<typeof useCreateDocumentCommentMutation>);

    renderWithProviders(
      <CommentForm
        companyId={COMPANY_ID}
        documentType="INVOICE"
        documentId={INVOICE_ID}
        onSuccess={onSuccess}
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '  Delivery update  ' },
    });
    await user.click(screen.getByRole('button', { name: 'Post comment' }));

    await waitFor(() => {
      expect(createComment).toHaveBeenCalledWith({
        companyId: COMPANY_ID,
        documentType: 'INVOICE',
        documentId: INVOICE_ID,
        body: 'Delivery update',
      });
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
