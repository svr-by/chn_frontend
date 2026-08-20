import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { DocumentListItemLayout } from '@/components/layouts/documentListItemLayout/DocumentListItemLayout';
import type { InboundMaterialRequestSummary } from '@/api/generated/models/inboundMaterialRequestSummary';
import type { MaterialRequestSummary } from '@/api/generated/models/materialRequestSummary';
import { StatusBadge } from '@/components/status/statusBadge/StatusBadge';
import { formatLocalizedDate } from '@/lib/dateFormat';
import type { MaterialRequestStatus } from '@/types/api';

type RequestCardProps =
  | {
      direction: 'outbound';
      request: MaterialRequestSummary;
      onClick: () => void;
    }
  | {
      direction: 'inbound';
      request: InboundMaterialRequestSummary;
      onClick: () => void;
    };

export function RequestCard({ request, onClick, direction }: RequestCardProps) {
  const { t, i18n } = useTranslation(['requests', 'enums']);

  const priorityLabel = t(
    `enums:materialRequestPriority.${request.priority.toLowerCase()}`,
  );

  return (
    <DocumentListItemLayout
      onClick={onClick}
      content={
        <>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {t('detail.title', { title: request.title })}
          </Typography>

          {direction === 'inbound' ? (
            <Typography variant="subtitle2" fontWeight={500} noWrap>
              {request.buyerCompany?.name ?? '—'}
            </Typography>
          ) : null}

          <Typography variant="body2" color="text.secondary" noWrap>
            {direction === 'inbound'
              ? formatLocalizedDate(request.distributedAt, i18n.language)
              : formatLocalizedDate(request.createdAt, i18n.language)}
            {request.assignee?.name ? ` · ${request.assignee?.name}` : ''}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {`${t('inbound.columns.lineCount')}: ${request.lineCount} · ${t('columns.priority')}: ${priorityLabel}`}
            {request.dueDate
              ? ` · ${t('columns.dueDate')}: ${formatLocalizedDate(request.dueDate, i18n.language)}`
              : ''}
          </Typography>
        </>
      }
      aside={<StatusBadge status={request.status as MaterialRequestStatus} />}
    />
  );
}
