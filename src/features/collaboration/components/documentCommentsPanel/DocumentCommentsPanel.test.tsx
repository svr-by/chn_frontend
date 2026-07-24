import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { useLazyListDocumentCommentsQuery } from '@/api/endpoints/commentsApi';
import { DocumentCommentsPanel } from '@/features/collaboration/components/documentCommentsPanel/DocumentCommentsPanel';
import { usePermissions } from '@/hooks/usePermissions';
import {
  COMPANY_ID,
  createComment,
  createTestUser,
  INVOICE_ID,
  USER_ID,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/commentsApi', () => ({
  useLazyListDocumentCommentsQuery: vi.fn(),
  useCreateDocumentCommentMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, error: undefined, reset: vi.fn() },
  ]),
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: vi.fn(),
}));

const mockedUseLazyListDocumentCommentsQuery = vi.mocked(
  useLazyListDocumentCommentsQuery,
);
const mockedUsePermissions = vi.mocked(usePermissions);

describe('DocumentCommentsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUsePermissions.mockReturnValue({
      user: createTestUser(),
      membership: undefined,
      permissions: [],
      isLoading: false,
      hasPermission: () => false,
      hasAnyPermission: () => false,
    });
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

  it('aligns own and other comments on opposite sides', async () => {
    mockedUseLazyListDocumentCommentsQuery.mockReturnValue([
      vi.fn().mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          comments: [
            createComment({
              id: '00000000-0000-0000-0000-0000000000c1',
              body: 'My own comment',
              author: {
                userId: USER_ID,
                companyId: COMPANY_ID,
                companyName: 'Acme Corp',
                name: 'Jane Doe',
                email: 'jane@example.com',
              },
            }),
            createComment({
              id: '00000000-0000-0000-0000-0000000000c2',
              body: 'Someone else comment',
              author: {
                userId: '00000000-0000-0000-0000-000000000099',
                companyId: COMPANY_ID,
                companyName: 'Other Corp',
                name: 'John Smith',
                email: 'john@example.com',
              },
            }),
          ],
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

    expect(await screen.findByText('My own comment')).toBeInTheDocument();
    expect(screen.getByText('Someone else comment')).toBeInTheDocument();

    const ownCard = screen.getByText('My own comment').closest('[data-own]');
    const otherCard = screen
      .getByText('Someone else comment')
      .closest('[data-own]');

    expect(ownCard).toHaveAttribute('data-own', 'true');
    expect(otherCard).toHaveAttribute('data-own', 'false');
  });

  it('renders older comments above newer ones near the input', async () => {
    mockedUseLazyListDocumentCommentsQuery.mockReturnValue([
      vi.fn().mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          comments: [
            createComment({
              id: '00000000-0000-0000-0000-0000000000c1',
              body: 'Newest comment',
              createdAt: '2026-01-03T12:00:00.000Z',
            }),
            createComment({
              id: '00000000-0000-0000-0000-0000000000c2',
              body: 'Oldest comment',
              createdAt: '2026-01-01T12:00:00.000Z',
            }),
          ],
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

    const oldest = await screen.findByText('Oldest comment');
    const newest = screen.getByText('Newest comment');
    const form = screen.getByRole('button', { name: 'Post comment' });

    expect(
      oldest.compareDocumentPosition(newest) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      newest.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
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
