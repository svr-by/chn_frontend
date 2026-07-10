import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { TradingPartnerStatus } from '@/api/generated/models/tradingPartnerStatus';

const STATUS_COLORS: Record<
  TradingPartnerStatus,
  'warning' | 'success' | 'default'
> = {
  INVITED: 'warning',
  ACTIVE: 'success',
  REJECTED: 'default',
};

interface PartnerStatusBadgeProps {
  status: TradingPartnerStatus;
}

export function PartnerStatusBadge({ status }: PartnerStatusBadgeProps) {
  const { t } = useTranslation('partners');

  return (
    <Chip
      label={t(`status.${status.toLowerCase()}`)}
      size="small"
      color={STATUS_COLORS[status]}
    />
  );
}
