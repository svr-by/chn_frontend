import { type ReactNode, useEffect, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { CommentDocumentType } from '@/api/generated/models/commentDocumentType';
import { DocumentActivityPanel } from '@/features/collaboration/components/documentActivityPanel/DocumentActivityPanel';
import { DocumentCommentsPanel } from '@/features/collaboration/components/documentCommentsPanel/DocumentCommentsPanel';
import { DocumentRelatedPanel } from '@/features/trace/components/DocumentRelatedPanel';
import { usePermissions } from '@/hooks/usePermissions';
import {
  parseDocumentDetailTab,
  type DocumentDetailTab,
} from '@/lib/documentRoutes';

type TabValue = 'details' | DocumentDetailTab | string;

interface DocumentDetailTabsProps {
  companyId: string;
  documentType: CommentDocumentType;
  documentId: string;
  enableComments?: boolean;
  extraTabs?: Array<{
    value: string;
    label: string;
    panel: ReactNode;
  }>;
}

interface TabPanelProps {
  value: TabValue;
  activeTab: TabValue;
  children: ReactNode;
}

function TabPanel({ value, activeTab, children }: TabPanelProps) {
  if (value !== activeTab) {
    return null;
  }

  return <Box sx={{ pt: 3 }}>{children}</Box>;
}

export function DocumentDetailTabs({
  companyId,
  documentType,
  documentId,
  enableComments = true,
  extraTabs,
}: DocumentDetailTabsProps) {
  const { t } = useTranslation('collaboration');
  const { hasPermission } = usePermissions();
  const canViewTrace = hasPermission('viewTrace');
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const tabFromUrl = parseDocumentDetailTab(rawTab) ?? rawTab;
  const [activeTab, setActiveTab] = useState<TabValue>(tabFromUrl ?? 'details');

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab('details');
    }
  }, [tabFromUrl]);

  function handleTabChange(_event: React.SyntheticEvent, value: TabValue) {
    setActiveTab(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value === 'details') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', value);
    }
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label={t('tabs.ariaLabel')}
      >
        {extraTabs?.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
        {enableComments ? (
          <Tab value="comments" label={t('tabs.comments')} />
        ) : null}
        <Tab value="activity" label={t('tabs.activity')} />
        {canViewTrace ? (
          <Tab value="related" label={t('tabs.related')} />
        ) : null}
      </Tabs>

      {extraTabs?.map((tab) => (
        <TabPanel key={tab.value} value={tab.value} activeTab={activeTab}>
          {tab.panel}
        </TabPanel>
      ))}
      {enableComments ? (
        <TabPanel value="comments" activeTab={activeTab}>
          <DocumentCommentsPanel
            companyId={companyId}
            documentType={documentType}
            documentId={documentId}
          />
        </TabPanel>
      ) : null}
      <TabPanel value="activity" activeTab={activeTab}>
        <DocumentActivityPanel
          companyId={companyId}
          documentType={documentType}
          documentId={documentId}
        />
      </TabPanel>
      {canViewTrace ? (
        <TabPanel value="related" activeTab={activeTab}>
          <DocumentRelatedPanel
            companyId={companyId}
            documentType={documentType}
            documentId={documentId}
          />
        </TabPanel>
      ) : null}
    </Box>
  );
}
