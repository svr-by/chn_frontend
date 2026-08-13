import { type SyntheticEvent } from 'react';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { InboundRequestLinesPanel } from '@/features/requests/components/inboundRequestLinesPanel/InboundRequestLinesPanel';
import { OutboundRequestLinesPanel } from '@/features/requests/components/outboundRequestLinesPanel/OutboundRequestLinesPanel';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePreferredListDirection } from '@/hooks/usePreferredListDirection';
import { PageShell } from '@/layouts/pageShell/PageShell';
import type { ListDirection } from '@/lib/preferredDirection';

export function RequestLinesPage() {
  const { t } = useTranslation('requests');
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { direction: tab, setDirection } = usePreferredListDirection({
    paramName: 'tab',
    absentMeans: 'outbound',
    family: 'requests',
  });

  if (!companyId) {
    return null;
  }

  function handleTabChange(_event: SyntheticEvent, value: ListDirection) {
    setDirection(value);
  }

  return (
    <PageShell maxWidth="xl">
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" component="h1">
            {t('requestLines.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tab === 'outbound'
              ? t('requestLines.subtitle')
              : t('requestLines.inbound.subtitle')}
          </Typography>
        </Box>

        <Tabs value={tab} onChange={handleTabChange}>
          <Tab label={t('tabs.outbound')} value="outbound" />
          <Tab label={t('tabs.inbound')} value="inbound" />
        </Tabs>

        {tab === 'outbound' ? (
          <OutboundRequestLinesPanel companyId={companyId} />
        ) : (
          <InboundRequestLinesPanel companyId={companyId} />
        )}
      </Stack>
    </PageShell>
  );
}
