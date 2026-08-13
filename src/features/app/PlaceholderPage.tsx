import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';

import { navConfig } from '@/lib/navConfig';
import { PageShell } from '@/layouts/pageShell/PageShell';

interface PlaceholderPageProps {
  path: string;
}

export function PlaceholderPage({ path }: PlaceholderPageProps) {
  const { t } = useTranslation(['common', 'nav']);
  const navItem = navConfig.find((item) => item.path === path);

  return (
    <PageShell maxWidth="lg">
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {navItem ? t(`nav:${navItem.labelKey}`) : path}
        </Typography>
        <Typography color="text.secondary">
          {t('common:app.comingSoon', { phase: navItem?.phase ?? '?' })}
        </Typography>
      </Box>
    </PageShell>
  );
}
