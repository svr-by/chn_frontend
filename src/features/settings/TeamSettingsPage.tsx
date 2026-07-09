import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import {
  useInviteMemberMutation,
  useListInvitationsQuery,
  useListMembersQuery,
  useRemoveMemberMutation,
  useRevokeInvitationMutation,
  useUpdateMemberRoleMutation,
} from '@/api/endpoints/membersApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PermissionGate } from '@/components/PermissionGate';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getApiLocale } from '@/lib/locale';
import type { MemberRole } from '@/types/api';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum([
    'ADMIN',
    'PROCUREMENT',
    'LOGISTICS',
    'ACCOUNTANT',
    'WAREHOUSE',
    'VIEWER',
  ]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const assignableRoles: MemberRole[] = [
  'ADMIN',
  'PROCUREMENT',
  'LOGISTICS',
  'ACCOUNTANT',
  'WAREHOUSE',
  'VIEWER',
];

function formatUserName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string,
): string {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || email;
}

export function TeamSettingsPage() {
  const { t } = useTranslation(['team', 'auth']);
  const { enqueueSnackbar } = useSnackbar();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  const membersQuery = useListMembersQuery(
    { companyId: companyId ?? '' },
    { skip: !companyId },
  );
  const invitationsQuery = useListInvitationsQuery(
    { companyId: companyId ?? '' },
    { skip: !companyId },
  );

  const [inviteMember, inviteState] = useInviteMemberMutation();
  const [revokeInvitation, revokeState] = useRevokeInvitationMutation();
  const [removeMember, removeState] = useRemoveMemberMutation();
  const [updateMemberRole, roleState] = useUpdateMemberRoleMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'VIEWER' },
  });

  const selectedRole = watch('role');

  if (!companyId) {
    return null;
  }

  const activeCompanyId: string = companyId;

  async function onInvite(values: InviteFormValues) {
    try {
      await inviteMember({
        companyId: activeCompanyId,
        email: values.email,
        role: values.role,
        locale: getApiLocale(),
      }).unwrap();
      enqueueSnackbar(t('team:inviteSent'), { variant: 'success' });
      setInviteOpen(false);
      reset();
    } catch {
      // dialog shows error
    }
  }

  async function handleRevoke(invitationId: string) {
    try {
      await revokeInvitation({ companyId: activeCompanyId, invitationId }).unwrap();
      enqueueSnackbar(t('team:invitationRevoked'), { variant: 'success' });
    } catch {
      // ApiErrorAlert
    }
  }

  async function handleRemoveMember() {
    if (!memberToRemove) {
      return;
    }

    try {
      await removeMember({ companyId: activeCompanyId, memberId: memberToRemove }).unwrap();
      enqueueSnackbar(t('team:memberRemoved'), { variant: 'success' });
      setMemberToRemove(null);
    } catch {
      // ApiErrorAlert
    }
  }

  async function handleRoleChange(memberId: string, role: MemberRole) {
    try {
      await updateMemberRole({
        companyId: activeCompanyId,
        memberId,
        body: { role },
      }).unwrap();
      enqueueSnackbar(t('team:roleUpdated'), { variant: 'success' });
    } catch {
      // ApiErrorAlert
    }
  }

  const pageError =
    membersQuery.error ??
    invitationsQuery.error ??
    inviteState.error ??
    revokeState.error ??
    removeState.error ??
    roleState.error;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5">{t('team:title')}</Typography>
        <PermissionGate permission="manageMembers">
          <Button variant="contained" onClick={() => setInviteOpen(true)}>
            {t('team:inviteMember')}
          </Button>
        </PermissionGate>
      </Stack>

      <ApiErrorAlert error={pageError} />

      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('team:activeMembers')}
      </Typography>

      <Table size="small" sx={{ mb: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>{t('team:member')}</TableCell>
            <TableCell>{t('team:role')}</TableCell>
            <TableCell>{t('team:status')}</TableCell>
            <TableCell align="right">{t('team:actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(membersQuery.data?.members ?? []).map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                {formatUserName(
                  member.user?.firstName,
                  member.user?.lastName,
                  member.user?.email ?? '',
                )}
              </TableCell>
              <TableCell>
                <PermissionGate
                  permission="manageMembers"
                  fallback={<Typography variant="body2">{member.role}</Typography>}
                >
                  {member.role === 'OWNER' ? (
                    member.role
                  ) : (
                    <Select
                      size="small"
                      value={member.role}
                      disabled={roleState.isLoading}
                      onChange={(event) =>
                        void handleRoleChange(
                          member.id,
                          event.target.value as MemberRole,
                        )
                      }
                    >
                      {assignableRoles.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </PermissionGate>
              </TableCell>
              <TableCell>{member.status}</TableCell>
              <TableCell align="right">
                <PermissionGate permission="manageMembers">
                  {member.role !== 'OWNER' && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setMemberToRemove(member.id)}
                    >
                      {t('team:remove')}
                    </Button>
                  )}
                </PermissionGate>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('team:pendingInvitations')}
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('auth:email')}</TableCell>
            <TableCell>{t('team:role')}</TableCell>
            <TableCell>{t('team:expiresAt')}</TableCell>
            <TableCell align="right">{t('team:actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(invitationsQuery.data?.invitations ?? []).map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell>{invitation.email}</TableCell>
              <TableCell>{invitation.role}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </Typography>
                  {invitation.expired && (
                    <Chip label={t('team:expired')} size="small" />
                  )}
                </Stack>
              </TableCell>
              <TableCell align="right">
                <PermissionGate permission="manageMembers">
                  <Button
                    size="small"
                    disabled={revokeState.isLoading}
                    onClick={() => void handleRevoke(invitation.id)}
                  >
                    {t('team:revoke')}
                  </Button>
                </PermissionGate>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('team:inviteMember')}</DialogTitle>
        <Box component="form" onSubmit={(event) => void handleSubmit(onInvite)(event)}>
          <DialogContent>
            <ApiErrorAlert error={inviteState.error} />
            <TextField
              {...register('email')}
              label={t('auth:email')}
              type="email"
              fullWidth
              margin="normal"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('team:role')}</InputLabel>
              <Select
                label={t('team:role')}
                value={selectedRole}
                onChange={(event) =>
                  setValue('role', event.target.value as InviteFormValues['role'])
                }
              >
                {assignableRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInviteOpen(false)}>{t('team:cancel')}</Button>
            <Button type="submit" variant="contained" disabled={inviteState.isLoading}>
              {t('team:sendInvite')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(memberToRemove)} onClose={() => setMemberToRemove(null)}>
        <DialogTitle>{t('team:removeMemberTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('team:removeMemberConfirm')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemberToRemove(null)}>{t('team:cancel')}</Button>
          <Button
            color="error"
            variant="contained"
            disabled={removeState.isLoading}
            onClick={() => void handleRemoveMember()}
          >
            {t('team:remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
