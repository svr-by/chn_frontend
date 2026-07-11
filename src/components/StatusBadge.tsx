import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { MaterialRequestStatus } from '@/types/api';

const STATUS_COLORS: Record<
  MaterialRequestStatus,
  'default' | 'info' | 'warning' | 'success'
> = {
  DRAFT: 'default',
  SUBMITTED: 'info',
  QUOTING: 'warning',
  PARTIALLY_ORDERED: 'warning',
  ORDERED: 'success',
  CLOSED: 'default',
};

interface StatusBadgeProps {
  status: MaterialRequestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation('enums');

  return (
    <Chip
      label={t(`materialRequestStatus.${status.toLowerCase()}`)}
      size="small"
      color={STATUS_COLORS[status]}
    />
  );
}
