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
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { PermissionGate } from '@/components/auth/permissionGate/PermissionGate';
import { ActivePartnersTable } from '@/features/partners/components/ActivePartnersTable';
import { PartnerInviteDialog } from '@/features/partners/components/PartnerInviteDialog';
import { PartnerInvitationsTable } from '@/features/partners/components/PartnerInvitationsTable';
import { useAppSelector } from '@/hooks/useAppSelector';
import { PageShell } from '@/layouts/pageShell/PageShell';

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

  async function handleCancel(partnerId: string) {
    try {
      await cancelInvitation({
        companyId: activeCompanyId,
        partnerId,
      }).unwrap();
      enqueueSnackbar(t('toast.cancelled'), { variant: 'success' });
    } catch {
      // ApiErrorAlert
    }
  }

  async function handleUnlink(partnerId: string) {
    try {
      await unlinkPartner({ companyId: activeCompanyId, partnerId }).unwrap();
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
    <PageShell maxWidth="xl">
      <Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          spacing={2}
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
              onClick={() => setInviteDialogOpen(true)}
            >
              {t('actions.invite')}
            </Button>
          </PermissionGate>
        </Stack>

        <ApiErrorAlert error={pageError} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider', flex: 1, minWidth: 0, mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_event, value: PartnersTab) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label={t('tabs.ariaLabel')}
          >
            <Tab
              label={t('tabs.partners', {
                count: partnersQuery.data?.partners.length ?? 0,
              })}
              value="partners"
            />
            <Tab
              label={t('tabs.invitations', {
                count: invitationsQuery.data?.partners.length ?? 0,
              })}
              value="invitations"
            />
          </Tabs>
        </Box>

        {tab === 'partners' && (
          <ActivePartnersTable
            partners={partnersQuery.data?.partners ?? []}
            isLoading={partnersQuery.isLoading}
            isFetching={partnersQuery.isFetching}
            onUnlink={(partnerId) => void handleUnlink(partnerId)}
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
    </PageShell>
  );
}
