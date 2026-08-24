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

import type { PatchCompaniesCompanyIdBody } from '@/api/generated/models/patchCompaniesCompanyIdBody';
import { useUpdateCompanyMutation } from '@/api/endpoints/companiesApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';

const COMPANY_NAME_MIN_LENGTH = 3;

function useCompanyProfileSave(companyId: string) {
  const { t } = useTranslation('profile');
  const { enqueueSnackbar } = useSnackbar();
  const [updateCompany, updateState] = useUpdateCompanyMutation();

  const save = useCallback(
    async (patch: PatchCompaniesCompanyIdBody): Promise<void> => {
      await updateCompany({ companyId, ...patch }).unwrap();
      enqueueSnackbar(t('toast.updated'), { variant: 'success' });
    },
    [companyId, enqueueSnackbar, t, updateCompany],
  );

  return { save, error: updateState.error, isLoading: updateState.isLoading };
}

function CompanyTextFieldDialog({
  title,
  fieldLabel,
  ariaLabel,
  value,
  helperText,
  minLength,
  companyId,
  field,
}: {
  title: string;
  fieldLabel: string;
  ariaLabel: string;
  value: string;
  helperText?: string;
  minLength: number;
  companyId: string;
  field: keyof PatchCompaniesCompanyIdBody;
}) {
  const { t } = useTranslation(['profile', 'validation']);
  const { save, error, isLoading } = useCompanyProfileSave(companyId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setLocalError(null);
    }
  }, [open, value]);

  async function handleSave() {
    const trimmed = draft.trim();

    if (trimmed.length === 0 && value.length === 0) {
      setOpen(false);
      return;
    }

    if (trimmed.length < minLength) {
      setLocalError(t('validation:minLength', { min: minLength }));
      return;
    }

    if (trimmed === value) {
      setOpen(false);
      return;
    }

    await save({ [field]: trimmed });
    setOpen(false);
  }

  return (
    <>
      <Tooltip title={ariaLabel}>
        <IconButton
          size="small"
          aria-label={ariaLabel}
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
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <ApiErrorAlert error={error} />
            <TextField
              label={fieldLabel}
              fullWidth
              autoFocus
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setLocalError(null);
              }}
              error={Boolean(localError)}
              helperText={localError ?? helperText}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleSave();
                }
              }}
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

export function CompanyNameEditButton({
  companyId,
  name,
}: {
  companyId: string;
  name: string;
}) {
  const { t } = useTranslation('profile');

  return (
    <CompanyTextFieldDialog
      companyId={companyId}
      field="name"
      value={name}
      title={t('editCompanyName')}
      fieldLabel={t('fields.companyName')}
      ariaLabel={t('editCompanyName')}
      helperText={t('companyNameHint')}
      minLength={COMPANY_NAME_MIN_LENGTH}
    />
  );
}

export function CompanyCountryEditButton({
  companyId,
  country,
}: {
  companyId: string;
  country: string | null;
}) {
  const { t } = useTranslation('profile');

  return (
    <CompanyTextFieldDialog
      companyId={companyId}
      field="country"
      value={country ?? ''}
      title={t('editCountry')}
      fieldLabel={t('fields.country')}
      ariaLabel={t('editCountry')}
      minLength={1}
    />
  );
}

export function CompanyTaxIdEditButton({
  companyId,
  taxId,
}: {
  companyId: string;
  taxId: string | null;
}) {
  const { t } = useTranslation('profile');

  return (
    <CompanyTextFieldDialog
      companyId={companyId}
      field="taxId"
      value={taxId ?? ''}
      title={t('editTaxId')}
      fieldLabel={t('fields.taxId')}
      ariaLabel={t('editTaxId')}
      minLength={1}
    />
  );
}
