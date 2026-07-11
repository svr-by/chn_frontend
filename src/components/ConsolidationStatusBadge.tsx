import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { ConsolidationStatus } from '@/api/generated/models/consolidationStatus';

const STATUS_COLORS: Record<
  ConsolidationStatus,
  'default' | 'info' | 'warning' | 'secondary' | 'success'
> = {
  DRAFT: 'default',
  PLANNED: 'info',
  IN_TRANSIT: 'warning',
  CUSTOMS: 'secondary',
  DELIVERED: 'success',
};

interface ConsolidationStatusBadgeProps {
  status: ConsolidationStatus;
}

export function ConsolidationStatusBadge({
  status,
}: ConsolidationStatusBadgeProps) {
  const { t } = useTranslation('enums');

  return (
    <Chip
      label={t(`consolidationStatus.${status.toLowerCase()}`)}
      size="small"
      color={STATUS_COLORS[status]}
    />
  );
}
