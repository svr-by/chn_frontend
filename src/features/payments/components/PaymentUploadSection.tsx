import { useState } from 'react';
import { Stack, Typography, Button } from '@mui/material';
import type { Accept } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useUploadPaymentProofMutation } from '@/api/endpoints/paymentsApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { FileUploadZone } from '@/components/forms/fileUploadZone/FileUploadZone';

const PAYMENT_PROOF_ACCEPT: Accept = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

interface PaymentUploadSectionProps {
  companyId: string;
  paymentId: string;
  invoiceId: string;
}

export function PaymentUploadSection({
  companyId,
  paymentId,
  invoiceId,
}: PaymentUploadSectionProps) {
  const { t } = useTranslation('payments');
  const { enqueueSnackbar } = useSnackbar();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProof, uploadState] = useUploadPaymentProofMutation();

  async function handleUpload() {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    await uploadProof({
      companyId,
      paymentId,
      invoiceId,
      formData,
    }).unwrap();

    enqueueSnackbar(t('toast.uploaded'), { variant: 'success' });
    setFile(null);
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6">{t('upload.title')}</Typography>
      <ApiErrorAlert error={uploadState.error} />
      <FileUploadZone
        accept={PAYMENT_PROOF_ACCEPT}
        file={file}
        onFileChange={setFile}
        disabled={uploadState.isLoading}
        translationNamespace="payments"
        hintKey="upload.hint"
        dropIdleKey="upload.dropIdle"
        dropActiveKey="upload.dropActive"
        browseKey="upload.browse"
        selectedKey="upload.selected"
        clearKey="upload.clear"
      />
      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={!file || uploadState.isLoading}
      >
        {t('actions.upload')}
      </Button>
    </Stack>
  );
}
