import { Chip } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { isRequestLineCancelled } from '@/lib/requestLineCancelled';

interface RequestLineCancelledBadgeProps {
  cancelledAt: string | null | undefined;
}

export function RequestLineCancelledBadge({
  cancelledAt,
}: RequestLineCancelledBadgeProps) {
  const { t } = useTranslation('common');

  if (!isRequestLineCancelled(cancelledAt)) {
    return null;
  }

  return (
    <Chip
      label={t('requestLine.cancelledOnRequest')}
      size="small"
      variant="outlined"
      color="error"
      title={dayjs(cancelledAt).format('YYYY-MM-DD HH:mm')}
    />
  );
}
