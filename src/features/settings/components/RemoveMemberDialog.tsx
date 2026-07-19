import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useRemoveMemberMutation } from '@/api/endpoints/membersApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';

interface RemoveMemberDialogProps {
  open: boolean;
  companyId: string;
  memberId: string | null;
  onClose: () => void;
}

export function RemoveMemberDialog({
  open,
  companyId,
  memberId,
  onClose,
}: RemoveMemberDialogProps) {
  const { t } = useTranslation('team');
  const { enqueueSnackbar } = useSnackbar();
  const [removeMember, removeState] = useRemoveMemberMutation();

  async function handleRemove() {
    if (!memberId) {
      return;
    }

    try {
      await removeMember({ companyId, memberId }).unwrap();
      enqueueSnackbar(t('memberRemoved'), { variant: 'success' });
      onClose();
    } catch {
      // ApiErrorAlert
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('removeMemberTitle')}</DialogTitle>
      <DialogContent>
        <ApiErrorAlert error={removeState.error} />
        <Typography>{t('removeMemberConfirm')}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button
          color="error"
          variant="contained"
          disabled={removeState.isLoading}
          onClick={() => void handleRemove()}
        >
          {t('remove')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
