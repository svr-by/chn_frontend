import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { DecimalDisplay } from '@/components/dataDisplay/decimalDisplay/DecimalDisplay';

interface InvoiceAmountSummaryProps {
  totalAmount: string;
  confirmedPaidAmount: string;
  remainingAmount: string;
  currency: string;
}

export function InvoiceAmountSummary({
  totalAmount,
  currency,
}: InvoiceAmountSummaryProps) {
  const { t } = useTranslation('invoices');

  return (
    <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
      <Typography variant="body2" color="text.secondary">
        {t('amounts.total')}:{' '}
        <DecimalDisplay
          value={totalAmount}
          suffix={currency}
          groupDigits
          component="span"
        />
      </Typography>
      {/* <Typography variant="body2" color="text.secondary">
        {t('amounts.confirmedPaid')}:{' '}
        <DecimalDisplay
          value={confirmedPaidAmount}
          suffix={currency}
          groupDigits
          component="span"
        />
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('amounts.remaining')}:{' '}
        <DecimalDisplay
          value={remainingAmount}
          suffix={currency}
          groupDigits
          component="span"
        />
      </Typography> */}
    </Stack>
  );
}
