import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { CompanyMemberStatus } from '@/api/generated/models/companyMemberStatus';
import {
  useListMembersQuery,
  useUpdateMemberMutation,
  useUpdateMemberPermissionsMutation,
} from '@/api/endpoints/membersApi';
import { DocumentActionMenuItem } from '@/layouts/documentDetailLayout/DocumentDetailActionsMenu';
import { MemberPermissionsEditor } from '@/features/settings/components/MemberPermissionsEditor';
import { ASSIGNABLE_ROLES } from '@/features/settings/lib/assignableRoles';
import {
  formatMemberRole,
  formatUserName,
} from '@/features/settings/lib/memberDisplay';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';
import { DocumentDetailLayout } from '@/layouts/documentDetailLayout/DocumentDetailLayout';
import type { MemberRole, Permission } from '@/types/api';

const TEAM_PATH = '/app/settings/team';

function getOverrides(
  permissions: {
    grants?: Permission[] | null;
    denies?: Permission[] | null;
  } | null,
): { grants: Permission[]; denies: Permission[] } {
  return {
    grants: (permissions?.grants ?? []).filter(Boolean) as Permission[],
    denies: (permissions?.denies ?? []).filter(Boolean) as Permission[],
  };
}

export function MemberAccessPage() {
  const { t } = useTranslation(['team', 'enums', 'integrations']);
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { hasPermission } = usePermissions();

  const canManageRole = hasPermission('manageMembers');
  const canManagePermissions = hasPermission('manageMemberPermissions');
  const canAccess = canManageRole || canManagePermissions;

  const membersQuery = useListMembersQuery(
    { companyId: companyId ?? '' },
    { skip: !companyId },
  );

  const member = useMemo(
    () =>
      membersQuery.data?.members.find((item) => item.id === memberId) ?? null,
    [memberId, membersQuery.data?.members],
  );

  const [role, setRole] = useState<MemberRole>('VIEWER');
  const [status, setStatus] = useState<CompanyMemberStatus>('ACTIVE');
  const [grants, setGrants] = useState<Permission[]>([]);
  const [denies, setDenies] = useState<Permission[]>([]);

  const [updateMember, memberState] = useUpdateMemberMutation();
  const [updateMemberPermissions, permissionsState] =
    useUpdateMemberPermissionsMutation();

  useEffect(() => {
    if (!member) {
      return;
    }

    setRole(member.role);
    setStatus(member.status);
    const overrides = getOverrides(member.permissions);
    setGrants(overrides.grants);
    setDenies(overrides.denies);
  }, [member]);

  if (!companyId) {
    return null;
  }

  if (!canAccess) {
    return (
      <DocumentDetailLayout
        maxWidth="lg"
        title={t('team:accessTitle')}
        backFallbackTo={TEAM_PATH}
      >
        <Typography color="text.secondary">{t('team:noPermission')}</Typography>
      </DocumentDetailLayout>
    );
  }

  if (!membersQuery.isLoading && !member) {
    return (
      <DocumentDetailLayout
        maxWidth="lg"
        title={t('team:accessTitle')}
        backFallbackTo={TEAM_PATH}
      >
        <Typography color="text.secondary">
          {t('team:memberNotFound')}
        </Typography>
      </DocumentDetailLayout>
    );
  }

  const displayName = member
    ? formatUserName(
        member.user?.firstName,
        member.user?.lastName,
        member.user?.email ?? '',
      )
    : t('team:accessTitle');

  const isOwner = member?.role === 'OWNER';
  const hasOverrides =
    Boolean(member?.permissions?.grants?.length) ||
    Boolean(member?.permissions?.denies?.length);
  const roleChanged = Boolean(member && role !== member.role);
  const statusChanged = Boolean(member && status !== member.status);
  const initialOverrides = member
    ? getOverrides(member.permissions)
    : { grants: [], denies: [] };
  const permissionsChanged =
    JSON.stringify(grants) !== JSON.stringify(initialOverrides.grants) ||
    JSON.stringify(denies) !== JSON.stringify(initialOverrides.denies);

  const isSaving = memberState.isLoading || permissionsState.isLoading;
  const pageError =
    membersQuery.error ?? memberState.error ?? permissionsState.error;

  async function handleSave() {
    if (!member || !companyId) {
      return;
    }

    try {
      if (canManageRole && !isOwner && (roleChanged || statusChanged)) {
        const body: { role?: typeof role; status?: typeof status } = {};
        if (roleChanged) {
          body.role = role;
        }
        if (statusChanged) {
          body.status = status;
        }
        await updateMember({
          companyId,
          memberId: member.id,
          body,
        }).unwrap();
      }

      // Role change resets overrides on the server; re-apply only if the user edited them.
      if (canManagePermissions && !isOwner && permissionsChanged) {
        await updateMemberPermissions({
          companyId,
          memberId: member.id,
          body: { grants, denies },
        }).unwrap();
      }

      enqueueSnackbar(t('team:accessUpdated'), { variant: 'success' });
      navigate(TEAM_PATH);
    } catch {
      // ApiErrorAlert via pageError
    }
  }

  const isActive = status === 'ACTIVE';

  return (
    <DocumentDetailLayout
      maxWidth="lg"
      title={displayName}
      subtitle={member?.user?.email}
      loading={membersQuery.isLoading}
      error={pageError}
      backFallbackTo={TEAM_PATH}
      statusBadge={
        member ? (
          <Chip
            size="small"
            label={formatMemberRole(t, member.role)}
            color={isOwner ? 'primary' : 'default'}
          />
        ) : null
      }
      actionMenuItems={
        !isOwner ? (
          <>
            <DocumentActionMenuItem
              onClick={() => navigate(TEAM_PATH)}
              disabled={isSaving}
            >
              <ListItemIcon>
                <CloseOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('team:cancel')}</ListItemText>
            </DocumentActionMenuItem>
            <DocumentActionMenuItem
              disabled={
                isSaving ||
                (!roleChanged && !permissionsChanged && !statusChanged) ||
                (!canManageRole && !canManagePermissions)
              }
              onClick={() => void handleSave()}
            >
              <ListItemIcon>
                <SaveOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('team:save')}</ListItemText>
            </DocumentActionMenuItem>
          </>
        ) : null
      }
    >
      {isOwner ? (
        <Alert severity="info">{t('team:ownerAccessReadonly')}</Alert>
      ) : (
        <Stack spacing={4}>
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t('team:roleAndStatus')}
            </Typography>
            {hasOverrides && roleChanged ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {t('team:roleChangeResetsOverrides')}
              </Alert>
            ) : null}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              {canManageRole ? (
                <FormControl fullWidth sx={{ maxWidth: 360 }}>
                  <InputLabel id="member-access-role-label">
                    {t('team:role')}
                  </InputLabel>
                  <Select
                    labelId="member-access-role-label"
                    label={t('team:role')}
                    value={role === 'OWNER' ? 'VIEWER' : role}
                    onChange={(event) =>
                      setRole(event.target.value as MemberRole)
                    }
                  >
                    {ASSIGNABLE_ROLES.map((assignableRole) => (
                      <MenuItem key={assignableRole} value={assignableRole}>
                        {formatMemberRole(t, assignableRole)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Chip
                  size="small"
                  variant="outlined"
                  label={formatMemberRole(t, member?.role ?? 'VIEWER')}
                />
              )}

              {canManageRole ? (
                <FormControlLabel
                  control={
                    <Switch
                      checked={isActive}
                      disabled={isSaving}
                      onChange={(_event, checked) =>
                        setStatus(checked ? 'ACTIVE' : 'SUSPENDED')
                      }
                      inputProps={{
                        'aria-label': t('team:memberActive'),
                      }}
                    />
                  }
                  label={
                    isActive ? t('team:memberActive') : t('team:memberInactive')
                  }
                />
              ) : (
                <Chip
                  size="small"
                  color={isActive ? 'success' : 'warning'}
                  variant="outlined"
                  label={
                    isActive ? t('team:memberActive') : t('team:memberInactive')
                  }
                />
              )}
            </Stack>
          </Box>

          {canManagePermissions ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t('team:permissions')}
              </Typography>
              <MemberPermissionsEditor
                grants={grants}
                denies={denies}
                effectivePermissions={
                  (member?.effectivePermissions ?? []) as Permission[]
                }
                initialGrants={initialOverrides.grants}
                initialDenies={initialOverrides.denies}
                disabled={isSaving}
                onGrantsChange={setGrants}
                onDeniesChange={setDenies}
              />
            </Box>
          ) : (
            <Alert severity="info">{t('team:permissionsOwnerOnly')}</Alert>
          )}
        </Stack>
      )}
    </DocumentDetailLayout>
  );
}
