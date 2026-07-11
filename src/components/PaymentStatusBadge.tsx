import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { PaymentStatus } from '@/api/generated/models/paymentStatus';

const STATUS_COLORS: Record<
  PaymentStatus,
  'default' | 'info' | 'warning' | 'success' | 'error'
> = {
  PENDING: 'default',
  UPLOADED: 'info',
  CONFIRMED: 'success',
  REJECTED: 'error',
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const { t } = useTranslation('enums');

  return (
    <Chip
      label={t(`paymentStatus.${status.toLowerCase()}`)}
      size="small"
      color={STATUS_COLORS[status]}
    />
  );
}
