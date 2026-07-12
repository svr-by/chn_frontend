import { useCallback } from 'react';
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

import { useLazyGetLineageEventsQuery } from '@/api/endpoints/traceApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { useCursorList } from '@/hooks/useCursorList';
import {
  getLineageEventActorName,
  getLineageEventLabel,
} from '@/lib/traceLabels';

dayjs.extend(relativeTime);

const PAGE_SIZE = 20;

interface LineageEventsPanelProps {
  companyId: string;
  lineageId: string;
}

export function LineageEventsPanel({
  companyId,
  lineageId,
}: LineageEventsPanelProps) {
  const { t } = useTranslation(['trace', 'enums', 'collaboration']);
  const [trigger] = useLazyGetLineageEventsQuery();

  const fetchPage = useCallback(
    async (cursor?: string) => {
      const result = await trigger({
        companyId,
        lineageId,
        limit: PAGE_SIZE,
        cursor,
      }).unwrap();
      return {
        items: result.events,
        nextCursor: result.nextCursor ?? null,
      };
    },
    [companyId, lineageId, trigger],
  );

  const resetKey = `${companyId}-${lineageId}-events`;
  const { items, hasMore, isLoading, isLoadingMore, error, loadMore } =
    useCursorList({
      enabled: Boolean(companyId && lineageId),
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
      <Typography variant="h6" component="h2">
        {t('trace:detail.auditEvents')}
      </Typography>

      {error ? <ApiErrorAlert error={error as never} /> : null}

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('trace:events.empty')}
        </Typography>
      ) : (
        <List disablePadding>
          {items.map((event) => (
            <ListItem
              key={event.id}
              alignItems="flex-start"
              sx={{ px: 0, py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                <HistoryIcon fontSize="small" color="action" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      {getLineageEventLabel(event, t)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getLineageEventActorName(event, t)} ·{' '}
                      {dayjs(event.createdAt).fromNow()}
                    </Typography>
                  </Stack>
                }
              />
            </ListItem>
          ))}
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
              ? t('trace:events.loadingMore')
              : t('trace:events.loadMore')}
          </Button>
        </Box>
      ) : null}
    </Stack>
  );
}
