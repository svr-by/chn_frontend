import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSafeAppBack } from '@/hooks/useSafeAppBack';
import { useTranslation } from 'react-i18next';

interface BackLinkProps {
  to: string;
}

export function BackLink({ to }: BackLinkProps) {
  const handleBack = useSafeAppBack(to);
  const { t } = useTranslation('common');

  return (
    <Button
      variant="text"
      startIcon={<ArrowBackIcon fontSize="small" />}
      onClick={handleBack}
      sx={{ alignSelf: 'flex-start' }}
    >
      {t('app.backButton')}
    </Button>
  );
}
