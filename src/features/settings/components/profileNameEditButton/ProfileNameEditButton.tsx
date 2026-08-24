import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { PatchAuthMeBody } from '@/api/generated/models/patchAuthMeBody';
import { useUpdateMeMutation } from '@/api/endpoints/authApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';

function useUpdateMeSave() {
  const { t } = useTranslation('profile');
  const { enqueueSnackbar } = useSnackbar();
  const [updateMe, updateState] = useUpdateMeMutation();

  const save = useCallback(
    async (patch: PatchAuthMeBody): Promise<void> => {
      await updateMe(patch).unwrap();
      enqueueSnackbar(t('toast.updated'), { variant: 'success' });
    },
    [enqueueSnackbar, t, updateMe],
  );

  return { save, error: updateState.error, isLoading: updateState.isLoading };
}

export function ProfileNameEditButton({
  firstName,
  lastName,
}: {
  firstName: string | null;
  lastName: string | null;
}) {
  const { t } = useTranslation(['profile', 'validation']);
  const { save, error, isLoading } = useUpdateMeSave();
  const [open, setOpen] = useState(false);
  const [firstNameDraft, setFirstNameDraft] = useState(firstName ?? '');
  const [lastNameDraft, setLastNameDraft] = useState(lastName ?? '');
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFirstNameDraft(firstName ?? '');
      setLastNameDraft(lastName ?? '');
      setFirstNameError(null);
      setLastNameError(null);
    }
  }, [firstName, lastName, open]);

  async function handleSave() {
    const trimmedFirst = firstNameDraft.trim();
    const trimmedLast = lastNameDraft.trim();
    const currentFirst = firstName ?? '';
    const currentLast = lastName ?? '';
    let hasError = false;

    if (trimmedFirst.length === 0 && currentFirst.length > 0) {
      setFirstNameError(t('validation:minLength', { min: 1 }));
      hasError = true;
    }

    if (trimmedLast.length === 0 && currentLast.length > 0) {
      setLastNameError(t('validation:minLength', { min: 1 }));
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const patch: PatchAuthMeBody = {};
    if (trimmedFirst.length > 0 && trimmedFirst !== currentFirst) {
      patch.firstName = trimmedFirst;
    }
    if (trimmedLast.length > 0 && trimmedLast !== currentLast) {
      patch.lastName = trimmedLast;
    }

    if (Object.keys(patch).length === 0) {
      setOpen(false);
      return;
    }

    await save(patch);
    setOpen(false);
  }

  return (
    <>
      <Tooltip title={t('profile:editName')}>
        <IconButton
          size="small"
          aria-label={t('profile:editName')}
          onClick={() => setOpen(true)}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => !isLoading && setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t('profile:editName')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <ApiErrorAlert error={error} />
            <TextField
              label={t('profile:fields.firstName')}
              fullWidth
              autoFocus
              value={firstNameDraft}
              onChange={(event) => {
                setFirstNameDraft(event.target.value);
                setFirstNameError(null);
              }}
              error={Boolean(firstNameError)}
              helperText={firstNameError}
            />
            <TextField
              label={t('profile:fields.lastName')}
              fullWidth
              value={lastNameDraft}
              onChange={(event) => {
                setLastNameDraft(event.target.value);
                setLastNameError(null);
              }}
              error={Boolean(lastNameError)}
              helperText={lastNameError}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={isLoading}>
            {t('profile:actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={isLoading}
          >
            {t('profile:actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
