import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import {
  usePreviewCsvImportMutation,
  usePreviewHtmImportMutation,
} from '@/api/endpoints/importsApi';
import type { PostCompaniesCompanyIdImportsRequestLinesCsvPreview200 } from '@/api/generated/models/postCompaniesCompanyIdImportsRequestLinesCsvPreview200';
import type { PostCompaniesCompanyIdImportsRequestLinesHtmPreview200 } from '@/api/generated/models/postCompaniesCompanyIdImportsRequestLinesHtmPreview200';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { FileUploadZone } from '@/components/FileUploadZone';
import {
  ImportFormatOptions,
  type ImportFormatValues,
} from '@/features/imports/components/ImportFormatOptions';
import {
  isCsvImportFile,
  mapPreviewRowsToDraftLines,
  type DraftRequestLine,
} from '@/features/requests/types/draftRequestLine';
import { buildImportFormData } from '@/lib/buildImportFormData';

const DEFAULT_FORMAT: ImportFormatValues = {
  fieldDelimiter: ',',
  decimalSeparator: '.',
  title: '',
};

const FILE_ACCEPT = {
  'text/csv': ['.csv'],
  'application/vnd.ms-excel': ['.csv'],
  'text/html': ['.htm', '.html'],
  'application/xhtml+xml': ['.htm', '.html'],
};

type PreviewResult =
  | PostCompaniesCompanyIdImportsRequestLinesCsvPreview200
  | PostCompaniesCompanyIdImportsRequestLinesHtmPreview200;

interface RequestLinesImportDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  hasExistingLines: boolean;
  onApply: (lines: DraftRequestLine[]) => void;
}

export function RequestLinesImportDialog({
  open,
  onClose,
  companyId,
  hasExistingLines,
  onApply,
}: RequestLinesImportDialogProps) {
  const { t } = useTranslation(['requests', 'imports']);
  const { enqueueSnackbar } = useSnackbar();

  const [file, setFile] = useState<File | null>(null);
  const [formatValues, setFormatValues] =
    useState<ImportFormatValues>(DEFAULT_FORMAT);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);

  const [previewCsvImport, csvPreviewState] = usePreviewCsvImportMutation();
  const [previewHtmImport, htmPreviewState] = usePreviewHtmImportMutation();

  const isCsv = file ? isCsvImportFile(file) : false;
  const isPreviewing = csvPreviewState.isLoading || htmPreviewState.isLoading;
  const previewError = csvPreviewState.error ?? htmPreviewState.error;

  const draftLines = useMemo(
    () => (preview ? mapPreviewRowsToDraftLines(preview.preview.rows) : []),
    [preview],
  );

  function resetState() {
    setFile(null);
    setFormatValues(DEFAULT_FORMAT);
    setPreview(null);
    setReplaceConfirmOpen(false);
  }

  function handleClose() {
    resetState();
    onClose();
  }

  async function handlePreview() {
    if (!file) {
      return;
    }

    const formData = buildImportFormData({
      file,
      fieldDelimiter: formatValues.fieldDelimiter,
      decimalSeparator: formatValues.decimalSeparator,
    });

    setPreview(null);

    try {
      const result = isCsvImportFile(file)
        ? await previewCsvImport({ companyId, formData }).unwrap()
        : await previewHtmImport({ companyId, formData }).unwrap();
      setPreview(result);
    } catch {
      // ApiErrorAlert handles mutation error
    }
  }

  function applyLines(lines: DraftRequestLine[]) {
    onApply(lines);
    enqueueSnackbar(t('requests:toast.importApplied'), { variant: 'success' });
    handleClose();
  }

  function handleApplyClick() {
    if (draftLines.length === 0) {
      return;
    }

    if (hasExistingLines) {
      setReplaceConfirmOpen(true);
      return;
    }

    applyLines(draftLines);
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{t('requests:actions.importFromFile')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <ApiErrorAlert error={previewError} />

            <FileUploadZone
              accept={FILE_ACCEPT}
              file={file}
              onFileChange={(nextFile) => {
                setFile(nextFile);
                setPreview(null);
              }}
              disabled={isPreviewing}
              translationNamespace="requests"
              hintKey="import.uploadHint"
              dropIdleKey="import.dropIdle"
              dropActiveKey="import.dropActive"
              browseKey="import.browse"
              selectedKey="import.selected"
              clearKey="import.clear"
            />

            {file ? (
              <ImportFormatOptions
                values={formatValues}
                onChange={setFormatValues}
                disabled={isPreviewing}
                showFieldDelimiter={isCsv}
                showTitle={false}
              />
            ) : null}

            {preview ? (
              <Stack spacing={1}>
                <Typography variant="body2">
                  {t('imports:preview.summary.valid', {
                    count: preview.preview.validRowCount,
                  })}
                  {' · '}
                  {t('imports:preview.summary.invalid', {
                    count: preview.preview.invalidRowCount,
                  })}
                </Typography>
                {draftLines.length === 0 ? (
                  <Alert severity="warning">
                    {t('requests:import.noValidRows')}
                  </Alert>
                ) : (
                  <Alert severity="success">
                    {t('requests:import.readyToApply', {
                      count: draftLines.length,
                    })}
                  </Alert>
                )}
              </Stack>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isPreviewing}>
            {t('requests:actions.cancel')}
          </Button>
          <Button
            variant="outlined"
            onClick={handlePreview}
            disabled={!file || isPreviewing}
          >
            {t('imports:actions.preview')}
          </Button>
          <Button
            variant="contained"
            onClick={handleApplyClick}
            disabled={draftLines.length === 0 || isPreviewing}
          >
            {t('requests:actions.applyImport')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={replaceConfirmOpen}
        onClose={() => setReplaceConfirmOpen(false)}
      >
        <DialogTitle>{t('requests:confirm.replaceLinesTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('requests:confirm.replaceLinesMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplaceConfirmOpen(false)}>
            {t('requests:actions.cancel')}
          </Button>
          <Button
            color="warning"
            variant="contained"
            onClick={() => applyLines(draftLines)}
          >
            {t('requests:actions.applyImport')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
