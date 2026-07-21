import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import {
  MaterialRequestStatusValues,
  type MaterialRequestStatus,
} from '@/types/api';

const STATUS_COLORS = {
  [MaterialRequestStatusValues.DRAFT]: 'default',
  [MaterialRequestStatusValues.QUOTING]: 'warning',
  [MaterialRequestStatusValues.PARTIALLY_ORDERED]: 'warning',
  [MaterialRequestStatusValues.ORDERED]: 'success',
  [MaterialRequestStatusValues.CLOSED]: 'default',
} as const satisfies Record<
  MaterialRequestStatus,
  'default' | 'info' | 'warning' | 'success'
>;

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
