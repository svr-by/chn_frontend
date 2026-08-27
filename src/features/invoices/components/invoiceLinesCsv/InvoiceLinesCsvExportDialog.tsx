import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { getGetCompaniesCompanyIdInvoicesInvoiceIdLinesCsvUrl } from '@/api/generated/endpoints';
import {
  ImportFormatOptions,
  type ImportFormatValues,
} from '@/features/imports/components/ImportFormatOptions';
import { downloadAuthenticatedFile } from '@/lib/downloadAuthenticatedFile';

const DEFAULT_FORMAT: ImportFormatValues = {
  fieldDelimiter: ',',
  decimalSeparator: '.',
  title: '',
};

interface InvoiceLinesCsvExportDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  invoiceId: string;
}

export function InvoiceLinesCsvExportDialog({
  open,
  onClose,
  companyId,
  invoiceId,
}: InvoiceLinesCsvExportDialogProps) {
  const { t } = useTranslation('invoices');
  const { enqueueSnackbar } = useSnackbar();
  const [formatValues, setFormatValues] =
    useState<ImportFormatValues>(DEFAULT_FORMAT);
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
      const path = getGetCompaniesCompanyIdInvoicesInvoiceIdLinesCsvUrl(
        companyId,
        invoiceId,
        {
          fieldDelimiter: formatValues.fieldDelimiter,
          decimalSeparator: formatValues.decimalSeparator,
        },
      );
      await downloadAuthenticatedFile({
        url: `${baseUrl}${path}`,
        companyId,
        filename: 'invoice-lines.csv',
      });
      enqueueSnackbar(t('toast.csvExported'), { variant: 'success' });
      onClose();
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : t('toast.csvExportFailed'),
        { variant: 'error' },
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('csv.exportTitle')}</DialogTitle>
      <DialogContent>
        <Stack sx={{ pt: 1 }}>
          <ImportFormatOptions
            values={formatValues}
            onChange={setFormatValues}
            disabled={isDownloading}
            showTitle={false}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDownloading}>
          {t('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleDownload()}
          disabled={isDownloading}
        >
          {t('csv.download')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
