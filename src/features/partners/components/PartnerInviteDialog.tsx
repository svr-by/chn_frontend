import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
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
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import { isApiError } from '@/api/baseApi';
import { useInvitePartnerMutation } from '@/api/endpoints/partnersApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';

const inviteSchema = z.object({
  email: z.string().trim().email(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface AmbiguousCompany {
  id: string;
  name: string;
}

function extractAmbiguousCompanies(
  error: FetchBaseQueryError | SerializedError | undefined,
): AmbiguousCompany[] | null {
  if (!error || !('data' in error) || !isApiError(error.data)) {
    return null;
  }

  if (error.data.error.code !== 'PARTNER_CONTACT_AMBIGUOUS') {
    return null;
  }

  const details = error.data.error.details;
  if (
    !details ||
    typeof details !== 'object' ||
    !('companies' in details) ||
    !Array.isArray((details as { companies: unknown }).companies)
  ) {
    return null;
  }

  return (details as { companies: AmbiguousCompany[] }).companies.filter(
    (company): company is AmbiguousCompany =>
      typeof company?.id === 'string' && typeof company?.name === 'string',
  );
}

interface PartnerInviteDialogProps {
  open: boolean;
  companyId: string;
  onClose: () => void;
  onInvited?: () => void;
}

export function PartnerInviteDialog({
  open,
  companyId,
  onClose,
  onInvited,
}: PartnerInviteDialogProps) {
  const { t } = useTranslation('partners');
  const { enqueueSnackbar } = useSnackbar();
  const [invitePartner, inviteState] = useInvitePartnerMutation();
  const [ambiguousCompanies, setAmbiguousCompanies] = useState<
    AmbiguousCompany[] | null
  >(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '' },
  });

  function handleClose() {
    reset();
    setAmbiguousCompanies(null);
    setSelectedCompanyId('');
    inviteState.reset();
    onClose();
  }

  async function submitInvite(email: string, targetCompanyId?: string) {
    try {
      await invitePartner({
        companyId,
        email,
        ...(targetCompanyId ? { targetCompanyId } : {}),
      }).unwrap();
      enqueueSnackbar(t('toast.invited'), { variant: 'success' });
      onInvited?.();
      handleClose();
    } catch (error) {
      const companies = extractAmbiguousCompanies(
        error as FetchBaseQueryError | SerializedError,
      );
      if (companies && companies.length > 0) {
        setAmbiguousCompanies(companies);
        setSelectedCompanyId(companies[0]?.id ?? '');
        return;
      }

      setAmbiguousCompanies(null);
      setSelectedCompanyId('');

      if (
        error &&
        typeof error === 'object' &&
        'data' in error &&
        isApiError(error.data) &&
        error.data.error.code === 'PARTNER_CONTACT_NOT_FOUND'
      ) {
        enqueueSnackbar(t('toast.contactNotFound'), { variant: 'error' });
      }
    }
  }

  async function onInvite(values: InviteFormValues) {
    setAmbiguousCompanies(null);
    setSelectedCompanyId('');
    await submitInvite(values.email);
  }

  async function onResolveAmbiguous() {
    if (!selectedCompanyId) {
      return;
    }
    await submitInvite(getValues('email'), selectedCompanyId);
  }

  const showAmbiguousPicker =
    ambiguousCompanies !== null && ambiguousCompanies.length > 0;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('actions.invite')}</DialogTitle>
      <Box
        component="form"
        onSubmit={(event) => void handleSubmit(onInvite)(event)}
      >
        <DialogContent>
          {!showAmbiguousPicker && (
            <ApiErrorAlert error={inviteState.error} />
          )}

          <TextField
            {...register('email')}
            label={t('invite.email')}
            type="email"
            fullWidth
            margin="normal"
            autoFocus
            disabled={showAmbiguousPicker}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />

          {showAmbiguousPicker && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('invite.ambiguousHint')}
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="partner-invite-company-label">
                  {t('invite.company')}
                </InputLabel>
                <Select
                  labelId="partner-invite-company-label"
                  label={t('invite.company')}
                  value={selectedCompanyId}
                  onChange={(event) => setSelectedCompanyId(event.target.value)}
                >
                  {ambiguousCompanies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('actions.close')}</Button>
          {showAmbiguousPicker ? (
            <Button
              variant="contained"
              disabled={inviteState.isLoading || !selectedCompanyId}
              onClick={() => void onResolveAmbiguous()}
            >
              {t('actions.invite')}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              disabled={inviteState.isLoading}
            >
              {t('actions.invite')}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}
