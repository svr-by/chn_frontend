import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import { useInviteMemberMutation } from '@/api/endpoints/membersApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { ASSIGNABLE_ROLES } from '@/features/settings/lib/assignableRoles';
import { formatMemberRole } from '@/features/settings/lib/memberDisplay';
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

interface InviteMemberDialogProps {
  open: boolean;
  companyId: string;
  onClose: () => void;
}

export function InviteMemberDialog({
  open,
  companyId,
  onClose,
}: InviteMemberDialogProps) {
  const { t } = useTranslation(['team', 'auth', 'enums']);
  const { enqueueSnackbar } = useSnackbar();
  const [inviteMember, inviteState] = useInviteMemberMutation();

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

  function handleClose() {
    onClose();
    reset();
    inviteState.reset();
  }

  async function onInvite(values: InviteFormValues) {
    try {
      await inviteMember({
        companyId,
        email: values.email,
        role: values.role,
        locale: getApiLocale(),
      }).unwrap();
      enqueueSnackbar(t('team:inviteSent'), { variant: 'success' });
      handleClose();
    } catch {
      // dialog shows error
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('team:inviteMember')}</DialogTitle>
      <Box
        component="form"
        onSubmit={(event) => void handleSubmit(onInvite)(event)}
      >
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
              <InputLabel id="invite-member-role-label">{t('team:role')}</InputLabel>
              <Select
                labelId="invite-member-role-label"
                label={t('team:role')}
                value={selectedRole}
                onChange={(event) =>
                  setValue('role', event.target.value as InviteFormValues['role'])
                }
              >
              {ASSIGNABLE_ROLES.map((role: MemberRole) => (
                <MenuItem key={role} value={role}>
                  {formatMemberRole(t, role)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('team:cancel')}</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={inviteState.isLoading}
          >
            {t('team:sendInvite')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
