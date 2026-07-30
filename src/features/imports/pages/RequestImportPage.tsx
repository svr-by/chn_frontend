import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import {
  useConfirmImportMutation,
  usePreviewCsvImportMutation,
  useUploadImportMutation,
} from '@/api/endpoints/importsApi';
import type { PostCompaniesCompanyIdImportsRequestLinesCsvPreview200 } from '@/api/generated/models/postCompaniesCompanyIdImportsRequestLinesCsvPreview200';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { BackLink } from '@/components/BackLink';
import { FileUploadZone } from '@/components/FileUploadZone';
import { PermissionGate } from '@/components/PermissionGate';
import {
  ImportFormatOptions,
  type ImportFormatValues,
} from '@/features/imports/components/ImportFormatOptions';
import { ImportPreviewTable } from '@/features/imports/components/ImportPreviewTable';
import { useImportJobPolling } from '@/hooks/useImportJobPolling';
import { useAppSelector } from '@/hooks/useAppSelector';
import { buildImportFormData } from '@/lib/buildImportFormData';
import { ImportJobStatus } from '@/api/generated/models/importJobStatus';
import { PageShell } from '@/layouts/PageShell';

const DEFAULT_FORMAT: ImportFormatValues = {
  fieldDelimiter: ',',
  decimalSeparator: '.',
  title: '',
};

export function RequestImportPage() {
  const { t } = useTranslation(['imports', 'requests']);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const [file, setFile] = useState<File | null>(null);
  const [formatValues, setFormatValues] =
    useState<ImportFormatValues>(DEFAULT_FORMAT);
  const [preview, setPreview] =
    useState<PostCompaniesCompanyIdImportsRequestLinesCsvPreview200 | null>(
      null,
    );
  const [jobId, setJobId] = useState<string | null>(null);
  const [pollJob, setPollJob] = useState(false);
  const confirmStartedRef = useRef(false);

  const [previewCsvImport, previewState] = usePreviewCsvImportMutation();
  const [uploadImport, uploadState] = useUploadImportMutation();
  const [confirmImport, confirmState] = useConfirmImportMutation();

  const jobPolling = useImportJobPolling({
    companyId: companyId ?? '',
    jobId,
    poll: pollJob,
    skip: !pollJob,
  });

  const buildFormData = useCallback(
    (includeTitle: boolean) => {
      if (!file) {
        return null;
      }
      return buildImportFormData({
        file,
        fieldDelimiter: formatValues.fieldDelimiter,
        decimalSeparator: formatValues.decimalSeparator,
        title: includeTitle ? formatValues.title : undefined,
      });
    },
    [file, formatValues],
  );

  const handlePreview = async () => {
    if (!companyId || !file) {
      return;
    }

    const formData = buildFormData(false);
    if (!formData) {
      return;
    }

    setPreview(null);
    confirmStartedRef.current = false;

    try {
      const result = await previewCsvImport({ companyId, formData }).unwrap();
      setPreview(result);
    } catch {
      // ApiErrorAlert handles previewState.error
    }
  };

  const runConfirm = useCallback(
    async (targetJobId: string) => {
      if (!companyId || confirmStartedRef.current) {
        return;
      }

      confirmStartedRef.current = true;
      setPollJob(false);

      try {
        const result = await confirmImport({
          companyId,
          jobId: targetJobId,
        }).unwrap();
        enqueueSnackbar(t('imports:toast.imported'), { variant: 'success' });
        navigate(`/app/requests/${result.request.id}`);
      } catch {
        confirmStartedRef.current = false;
      }
    },
    [companyId, confirmImport, enqueueSnackbar, navigate, t],
  );

  const handleImport = async () => {
    if (
      !companyId ||
      !file ||
      !preview ||
      preview.preview.validRowCount === 0
    ) {
      return;
    }

    const formData = buildFormData(true);
    if (!formData) {
      return;
    }

    confirmStartedRef.current = false;
    setJobId(null);
    setPollJob(false);

    try {
      const result = await uploadImport({ companyId, formData }).unwrap();
      const uploadedJob = result.job;
      setJobId(uploadedJob.id);

      if (uploadedJob.status === ImportJobStatus.PREVIEW_READY) {
        await runConfirm(uploadedJob.id);
      } else {
        setPollJob(true);
      }
    } catch {
      // ApiErrorAlert handles uploadState.error
    }
  };

  useEffect(() => {
    if (!pollJob || !jobId || confirmStartedRef.current) {
      return;
    }

    if (jobPolling.isReady) {
      void runConfirm(jobId);
    }

    if (jobPolling.isFailed) {
      setPollJob(false);
      enqueueSnackbar(t('imports:toast.importFailed'), { variant: 'error' });
    }
  }, [
    pollJob,
    jobId,
    jobPolling.isReady,
    jobPolling.isFailed,
    runConfirm,
    enqueueSnackbar,
    t,
  ]);

  const isBusy =
    previewState.isLoading ||
    uploadState.isLoading ||
    confirmState.isLoading ||
    jobPolling.isPolling ||
    jobPolling.isFetching;

  const canPreview = Boolean(file) && !isBusy;
  const canImport = (preview?.preview.validRowCount ?? 0) > 0 && !isBusy;

  if (!companyId) {
    return null;
  }

  return (
    <PageShell maxWidth="md">
      <PermissionGate
        permission="manageRequests"
        fallback={
          <Typography color="text.secondary">
            {t('imports:noPermission')}
          </Typography>
        }
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <BackLink to="/app/requests" />
            <Typography variant="h5" component="h1">
              {t('imports:title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('imports:subtitle')}
            </Typography>
          </Stack>

          <Alert severity="info">{t('imports:workerHint')}</Alert>

          <FileUploadZone
            file={file}
            onFileChange={(nextFile) => {
              setFile(nextFile);
              setPreview(null);
              setJobId(null);
              setPollJob(false);
              confirmStartedRef.current = false;
            }}
            disabled={isBusy}
          />

          <ImportFormatOptions
            values={formatValues}
            onChange={setFormatValues}
            disabled={isBusy}
          />

          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              onClick={() => void handlePreview()}
              disabled={!canPreview}
            >
              {t('imports:actions.preview')}
            </Button>
            <Button
              variant="contained"
              onClick={() => void handleImport()}
              disabled={!canImport}
            >
              {t('imports:actions.import')}
            </Button>
          </Stack>

          <ApiErrorAlert
            error={
              previewState.error ??
              uploadState.error ??
              confirmState.error ??
              jobPolling.error
            }
          />

          {isBusy ? (
            <Box>
              <LinearProgress />
              {jobPolling.isPolling && jobPolling.status ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {t('imports:status.parsing', { status: jobPolling.status })}
                </Typography>
              ) : null}
            </Box>
          ) : null}

          {jobPolling.isFailed && jobPolling.job?.errorMessage ? (
            <Alert severity="error">{jobPolling.job.errorMessage}</Alert>
          ) : null}

          {preview ? <ImportPreviewTable preview={preview} /> : null}
        </Stack>
      </PermissionGate>
    </PageShell>
  );
}
