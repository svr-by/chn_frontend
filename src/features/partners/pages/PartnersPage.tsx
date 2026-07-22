import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import {
  useAcceptPartnerMutation,
  useCancelPartnerInvitationMutation,
  useListPartnerInvitationsQuery,
  useListPartnersQuery,
  useRejectPartnerMutation,
  useUnlinkPartnerMutation,
} from '@/api/endpoints/partnersApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PermissionGate } from '@/components/PermissionGate';
import { ActivePartnersTable } from '@/features/partners/components/ActivePartnersTable';
import { PartnerInviteDialog } from '@/features/partners/components/PartnerInviteDialog';
import { PartnerInvitationsTable } from '@/features/partners/components/PartnerInvitationsTable';
import { useAppSelector } from '@/hooks/useAppSelector';

type PartnersTab = 'partners' | 'invitations';

function resolveTab(tabParam: string | null): PartnersTab {
  if (
    tabParam === 'invitations' ||
    tabParam === 'inbound' ||
    tabParam === 'outbound'
  ) {
    return 'invitations';
  }
  return 'partners';
}

export function PartnersPage() {
  const { t } = useTranslation('partners');
  const { enqueueSnackbar } = useSnackbar();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<PartnersTab>(() =>
    resolveTab(searchParams.get('tab')),
  );
  const highlightLinkId = searchParams.get('linkId');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const partnersQuery = useListPartnersQuery(
    { companyId: companyId ?? '' },
    { skip: !companyId },
  );
  const invitationsQuery = useListPartnerInvitationsQuery(
    { companyId: companyId ?? '' },
    { skip: !companyId },
  );

  const [acceptPartner, acceptState] = useAcceptPartnerMutation();
  const [rejectPartner, rejectState] = useRejectPartnerMutation();
  const [cancelInvitation, cancelState] = useCancelPartnerInvitationMutation();
  const [unlinkPartner, unlinkState] = useUnlinkPartnerMutation();

  useEffect(() => {
    setTab(resolveTab(searchParams.get('tab')));
  }, [searchParams]);

  if (!companyId) {
    return null;
  }

  const activeCompanyId: string = companyId;

  async function handleAccept(linkId: string) {
    try {
      await acceptPartner({ companyId: activeCompanyId, linkId }).unwrap();
      enqueueSnackbar(t('toast.accepted'), { variant: 'success' });
    } catch {
      // ApiErrorAlert
    }
  }

  async function handleReject(linkId: string) {
    try {
      await rejectPartner({ companyId: activeCompanyId, linkId }).unwrap();
      enqueueSnackbar(t('toast.rejected'), { variant: 'success' });
    } catch {
      // ApiErrorAlert
    }
  }

  async function handleCancel(linkId: string) {
    try {
      await cancelInvitation({ companyId: activeCompanyId, linkId }).unwrap();
      enqueueSnackbar(t('toast.cancelled'), { variant: 'success' });
    } catch {
      // ApiErrorAlert
    }
  }

  async function handleUnlink(linkId: string) {
    try {
      await unlinkPartner({ companyId: activeCompanyId, linkId }).unwrap();
      enqueueSnackbar(t('toast.unlinked'), { variant: 'success' });
    } catch {
      // ApiErrorAlert
    }
  }

  const pageError =
    partnersQuery.error ??
    invitationsQuery.error ??
    acceptState.error ??
    rejectState.error ??
    cancelState.error ??
    unlinkState.error;

  const actionsDisabled =
    acceptState.isLoading ||
    rejectState.isLoading ||
    cancelState.isLoading ||
    unlinkState.isLoading;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Box>
          <Typography variant="h5">{t('title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('subtitle')}
          </Typography>
        </Box>
        <PermissionGate permission="managePartners">
          <Button
            variant="contained"
            startIcon={<PersonAddAlt1OutlinedIcon />}
            onClick={() => setInviteDialogOpen(true)}>
            {t('actions.invite')}
          </Button>
        </PermissionGate>
      </Stack>

      <ApiErrorAlert error={pageError} />

      <Tabs
        value={tab}
        onChange={(_event, value: PartnersTab) => setTab(value)}
        sx={{ mb: 3 }}
      >
        <Tab label={t('tabs.partners')} value="partners" />
        <Tab label={t('tabs.invitations')} value="invitations" />
      </Tabs>

      {tab === 'partners' && (
        <ActivePartnersTable
          partners={partnersQuery.data?.partners ?? []}
          isLoading={partnersQuery.isLoading}
          isFetching={partnersQuery.isFetching}
          onUnlink={(linkId) => void handleUnlink(linkId)}
          actionsDisabled={actionsDisabled}
        />
      )}

      {tab === 'invitations' && (
        <PartnerInvitationsTable
          partners={invitationsQuery.data?.partners ?? []}
          isLoading={invitationsQuery.isLoading}
          isFetching={invitationsQuery.isFetching}
          onAccept={(linkId) => void handleAccept(linkId)}
          onReject={(linkId) => void handleReject(linkId)}
          onCancel={(linkId) => void handleCancel(linkId)}
          actionsDisabled={actionsDisabled}
          highlightLinkId={highlightLinkId}
        />
      )}

      <PartnerInviteDialog
        open={inviteDialogOpen}
        companyId={activeCompanyId}
        onClose={() => setInviteDialogOpen(false)}
        onInvited={() => setTab('invitations')}
      />
    </Box>
  );
}
