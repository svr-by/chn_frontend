import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { SupplierInvoiceStatus } from '@/api/generated/models/supplierInvoiceStatus';

const STATUS_COLORS: Record<
  SupplierInvoiceStatus,
  'default' | 'info' | 'warning' | 'success' | 'error'
> = {
  DRAFT: 'default',
  ISSUED: 'info',
  PARTIALLY_PAID: 'warning',
  PAID: 'success',
  CONFIRMED: 'success',
};

interface InvoiceStatusBadgeProps {
  status: SupplierInvoiceStatus;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const { t } = useTranslation('enums');

  return (
    <Chip
      label={t(`supplierInvoiceStatus.${status.toLowerCase()}`)}
      size="small"
      color={STATUS_COLORS[status]}
    />
  );
}
