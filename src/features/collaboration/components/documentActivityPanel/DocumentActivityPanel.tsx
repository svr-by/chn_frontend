import { useCallback } from 'react';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import HistoryIcon from '@mui/icons-material/History';
import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'react-i18next';

import type { CommentDocumentType } from '@/api/generated/models/commentDocumentType';
import { useLazyListDocumentActivityQuery } from '@/api/endpoints/commentsApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import {
  getActivityItemActorName,
  getActivityItemLabel,
} from '@/lib/activityLabels';
import { useCursorList } from '@/hooks/useCursorList';

dayjs.extend(relativeTime);

const PAGE_SIZE = 20;

interface DocumentActivityPanelProps {
  companyId: string;
  documentType: CommentDocumentType;
  documentId: string;
}

export function DocumentActivityPanel({
  companyId,
  documentType,
  documentId,
}: DocumentActivityPanelProps) {
  const { t } = useTranslation(['collaboration', 'enums']);
  const [trigger] = useLazyListDocumentActivityQuery();

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
        items: result.activity,
        nextCursor: result.nextCursor ?? null,
      };
    },
    [companyId, documentId, documentType, trigger],
  );

  const resetKey = `${companyId}-${documentType}-${documentId}-activity`;
  const { items, hasMore, isLoading, isLoadingMore, error, loadMore } =
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
    <Stack spacing={2}>
      {error ? <ApiErrorAlert error={error as never} /> : null}

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('collaboration:activity.empty')}
        </Typography>
      ) : (
        <List disablePadding>
          {items.map((item) => {
            const label = getActivityItemLabel(item, t);
            const actorName = getActivityItemActorName(item, t);
            const Icon =
              item.source === 'comment' ? ChatBubbleOutlineIcon : HistoryIcon;

            return (
              <ListItem
                key={item.id}
                alignItems="flex-start"
                sx={{ px: 0, py: 1.5 }}
              >
                <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                  <Icon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  slotProps={{ primary: { component: 'div' } }}
                  primary={
                    <Stack spacing={0.5}>
                      <Typography variant="body2" component="span" display="block">
                        {label}
                      </Typography>
                      <Typography
                        variant="caption"
                        component="span"
                        color="text.secondary"
                        display="block"
                      >
                        {actorName} · {dayjs(item.createdAt).fromNow()}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}

      {hasMore ? (
        <Box>
          <Button
            variant="outlined"
            onClick={() => void loadMore()}
            disabled={isLoadingMore}
          >
            {isLoadingMore
              ? t('collaboration:activity.loadingMore')
              : t('collaboration:activity.loadMore')}
          </Button>
        </Box>
      ) : null}
    </Stack>
  );
}
