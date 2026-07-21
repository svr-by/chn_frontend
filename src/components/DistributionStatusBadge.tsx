import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { RequestDistributionStatus } from '@/api/generated/models/requestDistributionStatus';

const STATUS_COLORS = {
  PENDING: 'warning',
  REJECTED: 'error',
} as const satisfies Record<
  RequestDistributionStatus,
  'warning' | 'error'
>;

interface DistributionStatusBadgeProps {
  status: RequestDistributionStatus;
}

export function DistributionStatusBadge({ status }: DistributionStatusBadgeProps) {
  const { t } = useTranslation('enums');

  return (
    <Chip
      label={t(`requestDistributionStatus.${status.toLowerCase()}`)}
      size="small"
      color={STATUS_COLORS[status]}
    />
  );
}
