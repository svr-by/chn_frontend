import { useEffect, useState, type SyntheticEvent } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Box, Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

import { InboundRequestsPanel } from '@/features/requests/components/InboundRequestsPanel';
import { OutboundRequestsPanel } from '@/features/requests/components/OutboundRequestsPanel';
import { PermissionGate } from '@/components/PermissionGate';
import { useAppSelector } from '@/hooks/useAppSelector';

type RequestsTab = 'outbound' | 'inbound';

function parseTab(value: string | null): RequestsTab {
  return value === 'inbound' ? 'inbound' : 'outbound';
}

export function RequestsPage() {
  const { t } = useTranslation('requests');
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<RequestsTab>(() =>
    parseTab(searchParams.get('tab')),
  );

  useEffect(() => {
    setTab(parseTab(searchParams.get('tab')));
  }, [searchParams]);

  if (!companyId) {
    return null;
  }

  function handleTabChange(_event: SyntheticEvent, value: RequestsTab) {
    setTab(value);
    if (value === 'outbound') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: value });
    }
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
      >
        <Box>
          <Typography variant="h5" component="h1">
            {t('title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tab === 'outbound' ? t('subtitle') : t('inbound.subtitle')}
          </Typography>
        </Box>
        {tab === 'outbound' ? (
          <PermissionGate permission="manageRequests">
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                component={RouterLink}
                to="/app/requests/new"
                startIcon={<AddIcon />}
              >
                {t('actions.new')}
              </Button>
            </Stack>
          </PermissionGate>
        ) : null}
      </Stack>

      <Tabs value={tab} onChange={handleTabChange}>
        <Tab label={t('tabs.outbound')} value="outbound" />
        <Tab label={t('tabs.inbound')} value="inbound" />
      </Tabs>

      {tab === 'outbound' ? (
        <OutboundRequestsPanel companyId={companyId} />
      ) : (
        <InboundRequestsPanel companyId={companyId} />
      )}
    </Stack>
  );
}
