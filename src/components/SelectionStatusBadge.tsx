import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { PurchaseSelectionStatus } from '@/api/generated/models/purchaseSelectionStatus';

const STATUS_COLORS: Record<
  PurchaseSelectionStatus,
  'default' | 'info' | 'warning' | 'success' | 'error'
> = {
  DRAFT: 'default',
  CONFIRMED: 'success',
  CANCELLED: 'error',
};

interface SelectionStatusBadgeProps {
  status: PurchaseSelectionStatus;
}

export function SelectionStatusBadge({ status }: SelectionStatusBadgeProps) {
  const { t } = useTranslation('enums');

  return (
    <Chip
      label={t(`purchaseSelectionStatus.${status.toLowerCase()}`)}
      size="small"
      color={STATUS_COLORS[status]}
    />
  );
}
