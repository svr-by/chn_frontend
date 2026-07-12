import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import { useCreateExportJobMutation } from '@/api/endpoints/integrationApi';
import { PostCompaniesCompanyIdIntegrationExportsBodyType } from '@/api/generated/models/postCompaniesCompanyIdIntegrationExportsBodyType';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { useExportJobPolling } from '@/hooks/useExportJobPolling';
import { downloadAuthenticatedFile } from '@/lib/downloadAuthenticatedFile';

const exportSchema = z.object({
  type: z.nativeEnum(PostCompaniesCompanyIdIntegrationExportsBodyType),
  status: z.string().optional(),
  updatedSince: z.string().optional(),
  partnerCompanyId: z.string().uuid().optional().or(z.literal('')),
});

type ExportFormValues = z.infer<typeof exportSchema>;

interface ExportsPanelProps {
  companyId: string;
}

export function ExportsPanel({ companyId }: ExportsPanelProps) {
  const { t } = useTranslation('integrations');
  const { enqueueSnackbar } = useSnackbar();
  const [jobId, setJobId] = useState<string | null>(null);
  const [pollJob, setPollJob] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [createExportJob, createState] = useCreateExportJobMutation();

  const jobPolling = useExportJobPolling({
    companyId,
    jobId,
    poll: pollJob,
    skip: !pollJob,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExportFormValues>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      type: PostCompaniesCompanyIdIntegrationExportsBodyType.REQUESTS,
      status: '',
      updatedSince: '',
      partnerCompanyId: '',
    },
  });

  const selectedType = watch('type');

  async function onSubmit(values: ExportFormValues) {
    try {
      const filters: ExportFormValues = {
        type: values.type,
        status: values.status?.trim() || undefined,
        updatedSince: values.updatedSince?.trim() || undefined,
        partnerCompanyId: values.partnerCompanyId?.trim() || undefined,
      };

      const result = await createExportJob({
        companyId,
        type: values.type,
        filters: {
          status: filters.status,
          updatedSince: filters.updatedSince,
          partnerCompanyId: filters.partnerCompanyId,
        },
      }).unwrap();

      setJobId(result.job.id);
      setPollJob(true);
      enqueueSnackbar(t('exports.started'), { variant: 'info' });
    } catch {
      // ApiErrorAlert
    }
  }

  async function handleDownload() {
    if (!jobId) {
      return;
    }

    setIsDownloading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
      await downloadAuthenticatedFile({
        url: `${baseUrl}/companies/${companyId}/integration/exports/${jobId}/download`,
        companyId,
        filename: `export-${jobId}.json`,
      });
      enqueueSnackbar(t('exports.downloaded'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : t('exports.downloadFailed'),
        { variant: 'error' },
      );
    } finally {
      setIsDownloading(false);
    }
  }

  function handleReset() {
    setJobId(null);
    setPollJob(false);
  }

  const job = jobPolling.job;
  const showProgress = pollJob && jobPolling.isPolling;
  const showFailed = jobPolling.isFailed;
  const showCompleted = jobPolling.isCompleted;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('exports.title')}
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        {t('exports.workerHint')}
      </Alert>

      <ApiErrorAlert error={createState.error ?? jobPolling.error} />

      <Box
        component="form"
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        sx={{ maxWidth: 480 }}
      >
        <FormControl fullWidth margin="normal">
          <InputLabel>{t('exports.fields.type')}</InputLabel>
          <Select
            label={t('exports.fields.type')}
            value={selectedType}
            onChange={(event) =>
              setValue(
                'type',
                event.target.value as ExportFormValues['type'],
              )
            }
          >
            {Object.values(PostCompaniesCompanyIdIntegrationExportsBodyType).map(
              (type) => (
                <MenuItem key={type} value={type}>
                  {t(`exportTypes.${type}`)}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>

        <TextField
          {...register('status')}
          label={t('exports.fields.status')}
          fullWidth
          margin="normal"
          helperText={t('exports.fields.statusHint')}
        />
        <TextField
          {...register('updatedSince')}
          label={t('exports.fields.updatedSince')}
          type="datetime-local"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          {...register('partnerCompanyId')}
          label={t('exports.fields.partnerCompanyId')}
          fullWidth
          margin="normal"
          error={Boolean(errors.partnerCompanyId)}
          helperText={errors.partnerCompanyId?.message}
        />

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={createState.isLoading || showProgress}
          >
            {t('exports.start')}
          </Button>
          {jobId ? (
            <Button variant="outlined" onClick={handleReset}>
              {t('exports.reset')}
            </Button>
          ) : null}
        </Stack>
      </Box>

      {jobId ? (
        <Box sx={{ mt: 3, maxWidth: 480 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('exports.jobStatus', {
              status: job?.status ?? t('exports.status.unknown'),
            })}
          </Typography>

          {showProgress ? <LinearProgress sx={{ mb: 2 }} /> : null}

          {showFailed ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {job?.errorMessage ?? t('exports.failedGeneric')}
            </Alert>
          ) : null}

          {showCompleted ? (
            <Button
              variant="contained"
              onClick={() => void handleDownload()}
              disabled={isDownloading}
            >
              {t('exports.download')}
            </Button>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}
