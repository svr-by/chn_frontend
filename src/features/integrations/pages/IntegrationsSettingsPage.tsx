import { useSearchParams } from 'react-router-dom';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { PermissionGate } from '@/components/PermissionGate';
import { ApiKeysPanel } from '@/features/integrations/components/ApiKeysPanel';
import { ExportsPanel } from '@/features/integrations/components/ExportsPanel';
import { MappingsPanel } from '@/features/integrations/components/MappingsPanel';
import { WebhooksPanel } from '@/features/integrations/components/WebhooksPanel';
import { useAppSelector } from '@/hooks/useAppSelector';
import { PageShell } from '@/layouts/PageShell';

const TAB_KEYS = ['api-keys', 'mappings', 'webhooks', 'exports'] as const;
type TabKey = (typeof TAB_KEYS)[number];

function isTabKey(value: string | null): value is TabKey {
  return TAB_KEYS.includes(value as TabKey);
}

export function IntegrationsSettingsPage() {
  const { t } = useTranslation('integrations');
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabKey = isTabKey(tabParam) ? tabParam : 'api-keys';
  const tabIndex = TAB_KEYS.indexOf(activeTab);

  if (!companyId) {
    return null;
  }

  function handleTabChange(_event: React.SyntheticEvent, newIndex: number) {
    setSearchParams({ tab: TAB_KEYS[newIndex] });
  }

  return (
    <PageShell maxWidth="lg">
      <PermissionGate
        permission="manageIntegrations"
        fallback={
          <Typography color="text.secondary">{t('noPermission')}</Typography>
        }
      >
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('subtitle')}
          </Typography>

          <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label={t('tabs.apiKeys')} />
            <Tab label={t('tabs.mappings')} />
            <Tab label={t('tabs.webhooks')} />
            <Tab label={t('tabs.exports')} />
          </Tabs>

          {tabIndex === 0 ? <ApiKeysPanel companyId={companyId} /> : null}
          {tabIndex === 1 ? <MappingsPanel companyId={companyId} /> : null}
          {tabIndex === 2 ? <WebhooksPanel companyId={companyId} /> : null}
          {tabIndex === 3 ? <ExportsPanel companyId={companyId} /> : null}
        </Box>
      </PermissionGate>
    </PageShell>
  );
}
