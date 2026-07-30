import { Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { InboundMaterialRequestSummary } from '@/api/generated/models/inboundMaterialRequestSummary';
import type { MaterialRequestSummary } from '@/api/generated/models/materialRequestSummary';
import { StatusBadge } from '@/components/StatusBadge';
import type { MaterialRequestStatus } from '@/types/api';

type RequestCardProps =
  | {
      tab: 'outbound';
      request: MaterialRequestSummary;
      onClick: () => void;
    }
  | {
      tab: 'inbound';
      request: InboundMaterialRequestSummary;
      onClick: () => void;
    };

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export function RequestCard(props: RequestCardProps) {
  const { t } = useTranslation(['requests', 'enums']);
  const { request, onClick, tab } = props;

  const priorityLabel = t(
    `enums:materialRequestPriority.${request.priority.toLowerCase()}`,
  );

  return (
    <Paper
      component="button"
      type="button"
      variant="outlined"
      onClick={onClick}
      sx={{
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        p: 2,
        borderRadius: 1,
        bgcolor: 'background.paper',
        borderColor: 'divider',
        transition: (theme) =>
          theme.transitions.create(['border-color', 'background-color'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
        },
        '&:focus-visible': {
          outline: (theme) => `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
          {tab === 'inbound' ? (
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {props.request.buyerCompany.name}
            </Typography>
          ) : null}

          <Typography
            variant={tab === 'inbound' ? 'body1' : 'subtitle1'}
            fontWeight={tab === 'inbound' ? 500 : 600}
            noWrap
          >
            {request.title || '—'}
          </Typography>

          {tab === 'outbound' ? (
            <Typography variant="body2" color="text.secondary" noWrap>
              {t('columns.createdBy')}: {request.createdByUserName ?? '—'}
            </Typography>
          ) : null}

          <Typography variant="body2" color="text.secondary" noWrap>
            {`${t('columns.priority')}: ${priorityLabel} · ${t('columns.dueDate')}: ${formatDate(request.dueDate)}`}
          </Typography>

          {tab === 'outbound' ? (
            <Typography variant="body2" color="text.secondary">
              {t('columns.createdAt')}: {formatDateTime(request.createdAt)}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" noWrap>
              {`${t('inbound.columns.lineCount')}: ${props.request.lineCount} · ${t('inbound.columns.distributedAt')}: ${formatDateTime(props.request.distributedAt)}`}
            </Typography>
          )}
        </Stack>

        <StatusBadge status={request.status as MaterialRequestStatus} />
      </Stack>
    </Paper>
  );
}
