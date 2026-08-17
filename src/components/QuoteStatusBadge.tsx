import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { SupplierQuoteStatus } from '@/api/generated/models/supplierQuoteStatus';

const STATUS_COLORS: Record<
  SupplierQuoteStatus,
  'default' | 'info' | 'warning' | 'success' | 'error'
> = {
  DRAFT: 'default',
  SUBMITTED: 'info',
  PARTIALLY_ACCEPTED: 'success',
  ACCEPTED: 'success',
  REJECTED: 'error',
};

interface QuoteStatusBadgeProps {
  status: SupplierQuoteStatus;
}

export function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  const { t } = useTranslation('enums');

  return (
    <Chip
      label={t(`supplierQuoteStatus.${status.toLowerCase()}`)}
      size="small"
      color={STATUS_COLORS[status]}
    />
  );
}
