import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
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
  useInvitePartnerMutation,
  useSearchPartnerDirectoryQuery,
} from '@/api/endpoints/partnersApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PermissionGate } from '@/components/PermissionGate';

const searchSchema = z
  .object({
    mode: z.enum(['name', 'taxId']),
    query: z.string().trim().min(1),
  })
  .superRefine((values, ctx) => {
    if (values.mode === 'taxId' && values.query.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Required',
        path: ['query'],
      });
    }
  });

type SearchFormValues = z.infer<typeof searchSchema>;

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
  const [submittedParams, setSubmittedParams] = useState<
    { q?: string; taxId?: string } | null
  >(null);

  const [invitePartner, inviteState] = useInvitePartnerMutation();

  const directoryQuery = useSearchPartnerDirectoryQuery(
    {
      companyId,
      ...(submittedParams ?? {}),
    },
    { skip: !open || !submittedParams },
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { mode: 'name', query: '' },
  });

  const searchMode = watch('mode');

  function handleClose() {
    reset();
    setSubmittedParams(null);
    onClose();
  }

  function onSearch(values: SearchFormValues) {
    setSubmittedParams(
      values.mode === 'name'
        ? { q: values.query }
        : { taxId: values.query },
    );
  }

  async function handleInvite(partnerCompanyId: string) {
    try {
      await invitePartner({ companyId, partnerCompanyId }).unwrap();
      enqueueSnackbar(t('toast.invited'), { variant: 'success' });
      onInvited?.();
      handleClose();
    } catch {
      // ApiErrorAlert shows error
    }
  }

  const companies = directoryQuery.data?.companies ?? [];

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{t('actions.invite')}</DialogTitle>
      <Box
        component="form"
        onSubmit={(event) => void handleSubmit(onSearch)(event)}
      >
        <DialogContent>
          <ApiErrorAlert error={inviteState.error ?? directoryQuery.error} />

          <FormControl sx={{ mb: 2 }}>
            <RadioGroup
              row
              value={searchMode}
              onChange={(event) =>
                setValue('mode', event.target.value as SearchFormValues['mode'])
              }
            >
              <FormControlLabel
                value="name"
                control={<Radio />}
                label={t('search.byName')}
              />
              <FormControlLabel
                value="taxId"
                control={<Radio />}
                label={t('search.byTaxId')}
              />
            </RadioGroup>
          </FormControl>

          <Stack direction="row" spacing={2} alignItems="flex-start">
            <TextField
              {...register('query')}
              label={
                searchMode === 'name'
                  ? t('search.placeholderName')
                  : t('search.placeholderTaxId')
              }
              fullWidth
              error={Boolean(errors.query)}
              helperText={errors.query?.message}
            />
            <Button type="submit" variant="contained" sx={{ mt: 1 }}>
              {t('actions.search')}
            </Button>
          </Stack>

          {submittedParams && !directoryQuery.isLoading && companies.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              {t('empty.noResults')}
            </Typography>
          )}

          {companies.length > 0 && (
            <Table size="small" sx={{ mt: 3 }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('columns.name')}</TableCell>
                  <TableCell>{t('columns.taxId')}</TableCell>
                  <TableCell>{t('columns.country')}</TableCell>
                  <TableCell align="right">{t('columns.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.taxId ?? '—'}</TableCell>
                    <TableCell>{company.country ?? '—'}</TableCell>
                    <TableCell align="right">
                      <PermissionGate permission="managePartners">
                        <Button
                          size="small"
                          variant="contained"
                          disabled={inviteState.isLoading}
                          onClick={() => void handleInvite(company.id)}
                        >
                          {t('actions.invite')}
                        </Button>
                      </PermissionGate>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('actions.cancel')}</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
