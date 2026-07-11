import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Tabs,
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
  useAcceptPartnerMutation,
  useInvitePartnerMutation,
  useListInboundPartnersQuery,
  useListOutboundPartnersQuery,
  useRejectPartnerMutation,
  useSearchPartnerDirectoryQuery,
} from '@/api/endpoints/partnersApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PermissionGate } from '@/components/PermissionGate';
import { PartnerInviteDialog } from '@/features/partners/components/PartnerInviteDialog';
import { PartnerLinksTable } from '@/features/partners/components/PartnerLinksTable';
import { useAppSelector } from '@/hooks/useAppSelector';

const searchSchema = z.object({
  mode: z.enum(['name', 'taxId']),
  query: z.string().trim().min(1),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export function PartnersPage() {
  const { t } = useTranslation('partners');
  const { enqueueSnackbar } = useSnackbar();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const [tab, setTab] = useState(0);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [directorySearchParams, setDirectorySearchParams] = useState<
    { q?: string; taxId?: string } | null
  >(null);

  const inboundQuery = useListInboundPartnersQuery(
    { companyId: companyId ?? '' },
    { skip: !companyId },
  );
  const outboundQuery = useListOutboundPartnersQuery(
    { companyId: companyId ?? '' },
    { skip: !companyId },
  );
  const directoryQuery = useSearchPartnerDirectoryQuery(
    {
      companyId: companyId ?? '',
      ...(directorySearchParams ?? {}),
    },
    { skip: !companyId || !directorySearchParams },
  );

  const [acceptPartner, acceptState] = useAcceptPartnerMutation();
  const [rejectPartner, rejectState] = useRejectPartnerMutation();
  const [invitePartner, inviteState] = useInvitePartnerMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { mode: 'name', query: '' },
  });

  const searchMode = watch('mode');

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

  function onDirectorySearch(values: SearchFormValues) {
    setDirectorySearchParams(
      values.mode === 'name'
        ? { q: values.query }
        : { taxId: values.query },
    );
  }

  async function handleDirectoryInvite(partnerCompanyId: string) {
    try {
      await invitePartner({
        companyId: activeCompanyId,
        partnerCompanyId,
      }).unwrap();
      enqueueSnackbar(t('toast.invited'), { variant: 'success' });
      setTab(1);
    } catch {
      // ApiErrorAlert
    }
  }

  const pageError =
    inboundQuery.error ??
    outboundQuery.error ??
    directoryQuery.error ??
    acceptState.error ??
    rejectState.error ??
    inviteState.error;

  const actionsDisabled =
    acceptState.isLoading || rejectState.isLoading || inviteState.isLoading;

  const directoryCompanies = directoryQuery.data?.companies ?? [];

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
          <Button variant="contained" onClick={() => setInviteDialogOpen(true)}>
            {t('actions.invite')}
          </Button>
        </PermissionGate>
      </Stack>

      <ApiErrorAlert error={pageError} />

      <Tabs value={tab} onChange={(_event, value: number) => setTab(value)} sx={{ mb: 3 }}>
        <Tab label={t('tabs.inbound')} />
        <Tab label={t('tabs.outbound')} />
        <Tab label={t('tabs.directory')} />
      </Tabs>

      {tab === 0 && (
        <PartnerLinksTable
          partners={inboundQuery.data?.partners ?? []}
          variant="inbound"
          emptyMessage={t('empty.inbound')}
          onAccept={(linkId) => void handleAccept(linkId)}
          onReject={(linkId) => void handleReject(linkId)}
          actionsDisabled={actionsDisabled}
        />
      )}

      {tab === 1 && (
        <PartnerLinksTable
          partners={outboundQuery.data?.partners ?? []}
          variant="outbound"
          emptyMessage={t('empty.outbound')}
        />
      )}

      {tab === 2 && (
        <Box>
          <Box
            component="form"
            onSubmit={(event) => void handleSubmit(onDirectorySearch)(event)}
            sx={{ mb: 3 }}
          >
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
          </Box>

          {!directorySearchParams && (
            <Typography variant="body2" color="text.secondary">
              {t('empty.directory')}
            </Typography>
          )}

          {directorySearchParams &&
            !directoryQuery.isLoading &&
            directoryCompanies.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                {t('empty.noResults')}
              </Typography>
            )}

          {directoryCompanies.length > 0 && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('columns.name')}</TableCell>
                  <TableCell>{t('columns.taxId')}</TableCell>
                  <TableCell>{t('columns.country')}</TableCell>
                  <TableCell align="right">{t('columns.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {directoryCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.taxId ?? '—'}</TableCell>
                    <TableCell>{company.country ?? '—'}</TableCell>
                    <TableCell align="right">
                      <PermissionGate permission="managePartners">
                        <Button
                          size="small"
                          variant="contained"
                          disabled={actionsDisabled}
                          onClick={() => void handleDirectoryInvite(company.id)}
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
        </Box>
      )}

      <PartnerInviteDialog
        open={inviteDialogOpen}
        companyId={activeCompanyId}
        onClose={() => setInviteDialogOpen(false)}
        onInvited={() => setTab(1)}
      />
    </Box>
  );
}
