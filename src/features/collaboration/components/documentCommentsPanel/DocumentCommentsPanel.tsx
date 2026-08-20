import { useCallback } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { CommentDocumentType } from '@/api/generated/models/commentDocumentType';
import { useLazyListDocumentCommentsQuery } from '@/api/endpoints/commentsApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { CommentForm } from '@/features/collaboration/components/commentForm/CommentForm';
import { CommentMessageCard } from '@/features/collaboration/components/commentMessageCard/CommentMessageCard';
import { useCursorList } from '@/hooks/useCursorList';
import { usePermissions } from '@/hooks/usePermissions';

const PAGE_SIZE = 15;

interface DocumentCommentsPanelProps {
  companyId: string;
  documentType: CommentDocumentType;
  documentId: string;
}

export function DocumentCommentsPanel({
  companyId,
  documentType,
  documentId,
}: DocumentCommentsPanelProps) {
  const { t } = useTranslation('collaboration');
  const { user } = usePermissions();
  const [trigger] = useLazyListDocumentCommentsQuery();

  const fetchPage = useCallback(
    async (cursor?: string) => {
      const result = await trigger({
        companyId,
        documentType,
        documentId,
        limit: PAGE_SIZE,
        cursor,
      }).unwrap();
      return {
        items: result.comments,
        nextCursor: result.nextCursor ?? null,
      };
    },
    [companyId, documentId, documentType, trigger],
  );

  const resetKey = `${companyId}-${documentType}-${documentId}`;
  const { items, hasMore, isLoading, isLoadingMore, error, loadMore, reload } =
    useCursorList({
      enabled: Boolean(companyId && documentId),
      fetchPage,
      resetKey,
    });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {error ? <ApiErrorAlert error={error as never} /> : null}

      <CommentForm
        companyId={companyId}
        documentType={documentType}
        documentId={documentId}
        onSuccess={() => {
          void reload();
        }}
      />

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('comments.empty')}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {[...items]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((comment) => (
              <CommentMessageCard
                key={comment.id}
                comment={comment}
                isOwn={user?.id === comment.author.userId}
              />
            ))}
        </Stack>
      )}

      {hasMore ? (
        <Box display="flex" justifyContent="center">
          <Button
            variant="outlined"
            onClick={() => void loadMore()}
            disabled={isLoadingMore}
            startIcon={
              isLoadingMore ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <KeyboardArrowDownIcon />
              )
            }
          >
            {isLoadingMore ? t('comments.loadingMore') : t('comments.loadMore')}
          </Button>
        </Box>
      ) : null}
    </Stack>
  );
}
