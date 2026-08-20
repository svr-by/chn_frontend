import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useImportInboundRequestLinesCsvMutation } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { FileUploadZone } from '@/components/forms/fileUploadZone/FileUploadZone';
import {
  ImportFormatOptions,
  type ImportFormatValues,
} from '@/features/imports/components/ImportFormatOptions';
import { extractQuoteLinesCsvRowErrors } from '@/features/quotes/lib/quoteLinesCsv';
import { buildImportFormData } from '@/lib/buildImportFormData';

const DEFAULT_FORMAT: ImportFormatValues = {
  fieldDelimiter: ',',
  decimalSeparator: '.',
  title: '',
};

interface QuoteLinesCsvImportDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  requestId: string;
  quoteId?: string;
}

export function QuoteLinesCsvImportDialog({
  open,
  onClose,
  companyId,
  requestId,
  quoteId,
}: QuoteLinesCsvImportDialogProps) {
  const { t } = useTranslation('quotes');
  const { enqueueSnackbar } = useSnackbar();
  const [file, setFile] = useState<File | null>(null);
  const [formatValues, setFormatValues] =
    useState<ImportFormatValues>(DEFAULT_FORMAT);
  const [importCsv, importState] = useImportInboundRequestLinesCsvMutation();
  const rowErrors = extractQuoteLinesCsvRowErrors(importState.error);

  async function handleImport() {
    if (!file) {
      return;
    }

    try {
      await importCsv({
        companyId,
        requestId,
        quoteId,
        formData: buildImportFormData({
          file,
          fieldDelimiter: formatValues.fieldDelimiter,
          decimalSeparator: formatValues.decimalSeparator,
        }),
      }).unwrap();
      enqueueSnackbar(t('toast.csvImported'), { variant: 'success' });
      handleClose();
    } catch {
      // ApiErrorAlert + row table
    }
  }

  function handleClose() {
    setFile(null);
    importState.reset();
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('csv.importTitle')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <ApiErrorAlert error={importState.error} />
          <FileUploadZone
            file={file}
            onFileChange={setFile}
            disabled={importState.isLoading}
          />
          <ImportFormatOptions
            values={formatValues}
            onChange={setFormatValues}
            disabled={importState.isLoading}
            showTitle={false}
          />
          {rowErrors ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">{t('csv.rowErrors')}</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('csv.rowNumber')}</TableCell>
                    <TableCell>{t('csv.errors')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowErrors.map((row) => (
                    <TableRow key={row.rowNumber}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>{row.errors.join('; ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={importState.isLoading}>
          {t('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleImport()}
          disabled={!file || importState.isLoading}
        >
          {t('csv.upload')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
