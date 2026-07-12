import { type ReactNode, useEffect, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { CommentDocumentType } from '@/api/generated/models/commentDocumentType';
import { DocumentActivityPanel } from '@/features/collaboration/components/DocumentActivityPanel';
import { DocumentCommentsPanel } from '@/features/collaboration/components/DocumentCommentsPanel';
import {
  parseDocumentDetailTab,
  type DocumentDetailTab,
} from '@/lib/documentRoutes';

type TabValue = 'details' | DocumentDetailTab;

interface DocumentDetailTabsProps {
  companyId: string;
  documentType: CommentDocumentType;
  documentId: string;
  details: ReactNode;
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
  details,
}: DocumentDetailTabsProps) {
  const { t } = useTranslation('collaboration');
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = parseDocumentDetailTab(searchParams.get('tab'));
  const [activeTab, setActiveTab] = useState<TabValue>(tabFromUrl ?? 'details');

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
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
        <Tab value="details" label={t('tabs.details')} />
        <Tab value="comments" label={t('tabs.comments')} />
        <Tab value="activity" label={t('tabs.activity')} />
      </Tabs>

      <TabPanel value="details" activeTab={activeTab}>
        {details}
      </TabPanel>
      <TabPanel value="comments" activeTab={activeTab}>
        <DocumentCommentsPanel
          companyId={companyId}
          documentType={documentType}
          documentId={documentId}
        />
      </TabPanel>
      <TabPanel value="activity" activeTab={activeTab}>
        <DocumentActivityPanel
          companyId={companyId}
          documentType={documentType}
          documentId={documentId}
        />
      </TabPanel>
    </Box>
  );
}
