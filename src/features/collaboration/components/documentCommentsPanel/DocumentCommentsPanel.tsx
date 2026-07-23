import { useCallback } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'react-i18next';

import type { CommentDocumentType } from '@/api/generated/models/commentDocumentType';
import { useLazyListDocumentCommentsQuery } from '@/api/endpoints/commentsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { CommentForm } from '@/features/collaboration/components/commentForm/CommentForm';
import { useCursorList } from '@/hooks/useCursorList';

dayjs.extend(relativeTime);

const PAGE_SIZE = 20;

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

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('comments.empty')}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {items.map((comment) => (
            <Paper key={comment.id} variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={0.5}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="baseline"
                  flexWrap="wrap"
                >
                  <Typography variant="subtitle2">
                    {comment.author.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {comment.author.companyName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(comment.createdAt).fromNow()}
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {comment.body}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {hasMore ? (
        <Box>
          <Button
            variant="outlined"
            onClick={() => void loadMore()}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? t('comments.loadingMore') : t('comments.loadMore')}
          </Button>
        </Box>
      ) : null}

      <CommentForm
        companyId={companyId}
        documentType={documentType}
        documentId={documentId}
        onSuccess={() => {
          void reload();
        }}
      />
    </Stack>
  );
}
