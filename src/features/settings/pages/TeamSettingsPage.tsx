import { useState } from 'react';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import { Box, Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  useListInvitationsQuery,
  useListMembersQuery,
} from '@/api/endpoints/membersApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PermissionGate } from '@/components/PermissionGate';
import { InviteMemberDialog } from '@/features/settings/components/InviteMemberDialog';
import { InvitationsTable } from '@/features/settings/components/InvitationsTable';
import { MembersTable } from '@/features/settings/components/MembersTable';
import { RemoveMemberDialog } from '@/features/settings/components/RemoveMemberDialog';
import { useAppSelector } from '@/hooks/useAppSelector';

const TAB_KEYS = ['members', 'invitations'] as const;
type TabKey = (typeof TAB_KEYS)[number];

function isTabKey(value: string | null): value is TabKey {
  return TAB_KEYS.includes(value as TabKey);
}

export function TeamSettingsPage() {
  const { t } = useTranslation('team');
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  const tabParam = searchParams.get('tab');
  const activeTab: TabKey = isTabKey(tabParam) ? tabParam : 'members';
  const tabIndex = TAB_KEYS.indexOf(activeTab);

  const membersQuery = useListMembersQuery(
    { companyId: companyId ?? '' },
    { skip: !companyId },
  );
  const invitationsQuery = useListInvitationsQuery(
    { companyId: companyId ?? '' },
    { skip: !companyId },
  );

  if (!companyId) {
    return null;
  }

  const pageError =
    activeTab === 'members' ? membersQuery.error : invitationsQuery.error;

  function handleTabChange(_event: React.SyntheticEvent, newIndex: number) {
    setSearchParams({ tab: TAB_KEYS[newIndex] });
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" component="h1">
            {t('title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('subtitle')}
          </Typography>
        </Box>
        <PermissionGate permission="manageMembers">
          <Button
            variant="contained"
            startIcon={<PersonAddAlt1OutlinedIcon />}
            onClick={() => setInviteOpen(true)}
            sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
          >
            {t('inviteMember')}
          </Button>
        </PermissionGate>
      </Stack>

      <ApiErrorAlert error={pageError} />

      <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab
          label={t('tabs.members', {
            count: membersQuery.data?.members.length ?? 0,
          })}
        />
        <Tab
          label={t('tabs.invitations', {
            count: invitationsQuery.data?.invitations.length ?? 0,
          })}
        />
      </Tabs>

      {activeTab === 'members' ? (
        <MembersTable
          members={membersQuery.data?.members ?? []}
          isLoading={membersQuery.isLoading}
          isFetching={membersQuery.isFetching}
          onRemove={setMemberToRemove}
        />
      ) : (
        <InvitationsTable
          companyId={companyId}
          invitations={invitationsQuery.data?.invitations ?? []}
          isLoading={invitationsQuery.isLoading}
          isFetching={invitationsQuery.isFetching}
        />
      )}

      <InviteMemberDialog
        open={inviteOpen}
        companyId={companyId}
        onClose={() => setInviteOpen(false)}
      />

      <RemoveMemberDialog
        open={Boolean(memberToRemove)}
        companyId={companyId}
        memberId={memberToRemove}
        onClose={() => setMemberToRemove(null)}
      />
    </Box>
  );
}
