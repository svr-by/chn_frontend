import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { ShippingInvoiceStatus } from '@/api/generated/models/shippingInvoiceStatus';

const STATUS_COLORS: Record<
  ShippingInvoiceStatus,
  'default' | 'info' | 'warning' | 'success'
> = {
  DRAFT: 'default',
  ISSUED: 'info',
  IN_TRANSIT: 'warning',
  DELIVERED: 'success',
};

interface ShippingInvoiceStatusBadgeProps {
  status: ShippingInvoiceStatus;
}

export function ShippingInvoiceStatusBadge({
  status,
}: ShippingInvoiceStatusBadgeProps) {
  const { t } = useTranslation('enums');

  return (
    <Chip
      label={t(`shippingInvoiceStatus.${status.toLowerCase()}`)}
      size="small"
      color={STATUS_COLORS[status]}
    />
  );
}
