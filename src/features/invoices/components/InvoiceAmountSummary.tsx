import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { DecimalDisplay } from '@/components/DecimalDisplay';

interface InvoiceAmountSummaryProps {
  totalAmount: string;
  confirmedPaidAmount: string;
  remainingAmount: string;
  currency: string;
}

export function InvoiceAmountSummary({
  totalAmount,
  confirmedPaidAmount,
  remainingAmount,
  currency,
}: InvoiceAmountSummaryProps) {
  const { t } = useTranslation('invoices');

  return (
    <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
      <Typography variant="body2" color="text.secondary">
        {t('amounts.total')}:{' '}
        <DecimalDisplay value={totalAmount} component="span" /> {currency}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('amounts.confirmedPaid')}:{' '}
        <DecimalDisplay value={confirmedPaidAmount} component="span" /> {currency}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('amounts.remaining')}:{' '}
        <DecimalDisplay value={remainingAmount} component="span" /> {currency}
      </Typography>
    </Stack>
  );
}
