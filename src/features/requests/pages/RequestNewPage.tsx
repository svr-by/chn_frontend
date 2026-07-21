import { useMemo, useState, type SyntheticEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import { useCreateRequestMutation } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { BackLink } from '@/components/BackLink';
import { RequestDraftLinesSection } from '@/features/requests/components/RequestDraftLinesSection';
import { RequestLinesImportDialog } from '@/features/requests/components/RequestLinesImportDialog';
import {
  draftLinesToCreatePayload,
  type DraftRequestLine,
} from '@/features/requests/lib/draftRequestLine';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';

type FormTab = 'lines' | 'notes';

type RequestFormValues = {
  title: string;
  notes?: string;
};

export function RequestNewPage() {
  const { t } = useTranslation(['requests', 'validation']);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { hasPermission } = usePermissions();

  const [lines, setLines] = useState<DraftRequestLine[]>([]);
  const [linesError, setLinesError] = useState<string | undefined>();
  const [importOpen, setImportOpen] = useState(false);
  const [tab, setTab] = useState<FormTab>('lines');
  // Reserved for upcoming backend support; not sent with create yet.
  const [requestDate, setRequestDate] = useState<Dayjs | null>(dayjs());

  const [createRequest, createState] = useCreateRequestMutation();

  const requestSchema = useMemo(
    () =>
      z.object({
        title: z.string().trim().min(3, {
          message: t('validation:minLength', { min: 3 }),
        }),
        notes: z
          .string()
          .trim()
          .transform((value) => (value === '' ? undefined : value))
          .optional()
          .refine((value) => value === undefined || value.length >= 1, {
            message: t('validation:notEmpty'),
          }),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: '',
      notes: '',
    },
  });

  if (!companyId) {
    return null;
  }

  if (!hasPermission('manageRequests')) {
    return <Navigate to="/app/requests" replace />;
  }

  function handleTabChange(_event: SyntheticEvent, value: FormTab) {
    setTab(value);
  }

  async function onSubmit(values: RequestFormValues) {
    if (!companyId) {
      return;
    }

    if (lines.length === 0) {
      setLinesError(t('validation:minLines'));
      setTab('lines');
      return;
    }

    setLinesError(undefined);

    const result = await createRequest({
      companyId,
      title: values.title,
      notes: values.notes,
      lines: draftLinesToCreatePayload(lines),
    }).unwrap();

    enqueueSnackbar(t('toast.created'), { variant: 'success' });
    navigate(`/app/requests/${result.request.id}`);
  }

  return (
    <Stack spacing={3} maxWidth={960} sx={{ width: '100%', mx: 'auto' }}>
      <Stack spacing={1}>
        <BackLink to="/app/requests">{t('actions.backToList')}</BackLink>
        <Typography variant="h5" component="h1">
          {t('form.newTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('form.newSubtitle')}
        </Typography>
      </Stack>

      <ApiErrorAlert error={createState.error} />

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
            <TextField
              label={t('form.title')}
              fullWidth
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
              {...register('title')}
            />
            <DatePicker
              label={t('form.date')}
              value={requestDate}
              onChange={setRequestDate}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Stack>

          <Box>
            <Tabs value={tab} onChange={handleTabChange}>
              <Tab label={t('tabs.lines')} value="lines" />
              <Tab label={t('tabs.notes')} value="notes" />
            </Tabs>

            <Box sx={{ pt: 2 }}>
              {tab === 'lines' ? (
                <RequestDraftLinesSection
                  companyId={companyId}
                  lines={lines}
                  onImportClick={() => setImportOpen(true)}
                  onChange={(nextLines) => {
                    setLines(nextLines);
                    if (nextLines.length > 0) {
                      setLinesError(undefined);
                    }
                  }}
                  errorMessage={linesError}
                />
              ) : (
                <TextField
                  label={t('form.notes')}
                  fullWidth
                  multiline
                  minRows={6}
                  error={Boolean(errors.notes)}
                  helperText={errors.notes?.message}
                  {...register('notes')}
                />
              )}
            </Box>
          </Box>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              type="submit"
              variant="contained"
              disabled={createState.isLoading}
            >
              {t('actions.create')}
            </Button>
            <Button component={RouterLink} to="/app/requests">
              {t('actions.cancel')}
            </Button>
          </Stack>
        </Stack>
      </Box>

      <RequestLinesImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        companyId={companyId}
        hasExistingLines={lines.length > 0}
        onApply={setLines}
      />
    </Stack>
  );
}
