import { useEffect, useState, type SyntheticEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { InboundRequestLinesPanel } from '@/features/requests/components/InboundRequestLinesPanel';
import { OutboundRequestLinesPanel } from '@/features/requests/components/OutboundRequestLinesPanel';
import { useAppSelector } from '@/hooks/useAppSelector';
import { PageShell } from '@/layouts/PageShell';

type RequestLinesTab = 'outbound' | 'inbound';

function parseTab(value: string | null): RequestLinesTab {
  return value === 'inbound' ? 'inbound' : 'outbound';
}

export function RequestLinesPage() {
  const { t } = useTranslation('requests');
  const [searchParams, setSearchParams] = useSearchParams();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const [tab, setTab] = useState<RequestLinesTab>(() =>
    parseTab(searchParams.get('tab')),
  );

  useEffect(() => {
    setTab(parseTab(searchParams.get('tab')));
  }, [searchParams]);

  if (!companyId) {
    return null;
  }

  function handleTabChange(_event: SyntheticEvent, value: RequestLinesTab) {
    setTab(value);
    if (value === 'outbound') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: value });
    }
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
