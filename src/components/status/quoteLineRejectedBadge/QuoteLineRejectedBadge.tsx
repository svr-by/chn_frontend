import { Chip } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { isQuoteLineRejected } from '@/lib/quoteLineRejected';

interface QuoteLineRejectedBadgeProps {
  rejectedAt: string | null | undefined;
  rejectionReason?: string | null;
}

export function QuoteLineRejectedBadge({
  rejectedAt,
  rejectionReason,
}: QuoteLineRejectedBadgeProps) {
  const { t } = useTranslation('common');

  if (!isQuoteLineRejected(rejectedAt)) {
    return null;
  }

  const when = dayjs(rejectedAt).format('YYYY-MM-DD HH:mm');
  const title = rejectionReason?.trim()
    ? `${when} — ${rejectionReason.trim()}`
    : when;

  return (
    <Chip
      label={t('quoteLine.rejected')}
      size="small"
      variant="outlined"
      color="error"
      title={title}
    />
  );
}
