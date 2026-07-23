import { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetPaymentQuery } from '@/api/endpoints/paymentsApi';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { PaymentStatusBadge } from '@/components/PaymentStatusBadge';
import { DocumentDetailTabs } from '@/features/collaboration/components/documentDetailTabs/DocumentDetailTabs';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';
import { PaymentStatusActions } from '@/features/payments/components/PaymentStatusActions';
import { useAppSelector } from '@/hooks/useAppSelector';

export function PaymentDetailPage() {
  const { t } = useTranslation('payments');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { paymentId } = useParams<{ paymentId: string }>();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const paymentQuery = useGetPaymentQuery(
    { companyId: companyId ?? '', paymentId: paymentId ?? '' },
    { skip: !companyId || !paymentId },
  );

  const payment = paymentQuery.data?.payment;

  useEffect(() => {
    if (
      paymentQuery.isError &&
      'status' in paymentQuery.error &&
      paymentQuery.error.status === 404
    ) {
      enqueueSnackbar(t('toast.notFound'), { variant: 'error' });
      navigate('/app/payments', { replace: true });
    }
  }, [paymentQuery.isError, paymentQuery.error, enqueueSnackbar, navigate, t]);

  if (!companyId || !paymentId) {
    return null;
  }

  const title = t('detail.fallbackTitle', { id: paymentId.slice(0, 8) });

  return (
    <DocumentDetailLayout
      title={title}
      statusBadge={
        payment?.status ? (
          <PaymentStatusBadge status={payment.status} />
        ) : undefined
      }
      loading={paymentQuery.isLoading}
      error={paymentQuery.error}
      actions={
        payment ? (
          <PaymentStatusActions
            companyId={companyId}
            paymentId={payment.id}
            invoiceId={payment.invoiceId}
            status={payment.status}
          />
        ) : null
      }
      meta={
        payment ? (
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {t('detail.amount')}:{' '}
              <DecimalDisplay value={payment.amount} component="span" />{' '}
              {payment.currency}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('detail.invoice')}:{' '}
              <Link
                component={RouterLink}
                to={`/app/invoices/${payment.invoiceId}`}
                underline="hover"
              >
                {payment.invoiceId.slice(0, 8)}
              </Link>
            </Typography>
            {payment.fileName ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.fileName', { name: payment.fileName })}
              </Typography>
            ) : null}
            {payment.uploadedAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.uploadedAt', {
                  date: new Date(payment.uploadedAt).toLocaleString(),
                })}
              </Typography>
            ) : null}
            {payment.confirmedAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.confirmedAt', {
                  date: new Date(payment.confirmedAt).toLocaleString(),
                })}
              </Typography>
            ) : null}
            {payment.rejectedAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.rejectedAt', {
                  date: new Date(payment.rejectedAt).toLocaleString(),
                })}
              </Typography>
            ) : null}
            {payment.rejectionReason ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.rejectionReason', {
                  reason: payment.rejectionReason,
                })}
              </Typography>
            ) : null}
            {payment.notes ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.notes', { notes: payment.notes })}
              </Typography>
            ) : null}
          </Stack>
        ) : null
      }
    >
      {payment ? (
        <DocumentDetailTabs
          companyId={companyId}
          documentType="PAYMENT"
          documentId={payment.id}
          // paymentInvoiceId={payment.invoiceId}
          // details={
          //   canUpload ? (
          //     <PaymentUploadSection
          //       companyId={companyId}
          //       paymentId={payment.id}
          //       invoiceId={payment.invoiceId}
          //     />
          //   ) : null
          // }
        />
      ) : null}
    </DocumentDetailLayout>
  );
}
