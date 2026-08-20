import { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetPaymentQuery } from '@/api/endpoints/paymentsApi';
import { DecimalDisplay } from '@/components/dataDisplay/decimalDisplay/DecimalDisplay';
import { DocumentStatusProgress } from '@/components/status/documentStatusProgress/DocumentStatusProgress';
import { DocumentDetailTabs } from '@/features/collaboration/components/documentDetailTabs/DocumentDetailTabs';
import { DocumentDetailLayout } from '@/layouts/documentDetailLayout/DocumentDetailLayout';
import { PaymentStatusActions } from '@/features/payments/components/PaymentStatusActions';
import { PaymentUploadSection } from '@/features/payments/components/PaymentUploadSection';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';
import { PAYMENT_STATUS_FLOW } from '@/lib/documentStatusFlows';

export function PaymentDetailPage() {
  const { t } = useTranslation('payments');
  const { t: tCollab } = useTranslation('collaboration');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { paymentId } = useParams<{ paymentId: string }>();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { hasPermission } = usePermissions();

  const paymentQuery = useGetPaymentQuery(
    { companyId: companyId ?? '', paymentId: paymentId ?? '' },
    { skip: !companyId || !paymentId },
  );

  const payment = paymentQuery.data?.payment;
  const canUpload =
    payment?.status === 'PENDING' && hasPermission('managePayments');

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
          <DocumentStatusProgress
            currentStatus={payment.status}
            steps={PAYMENT_STATUS_FLOW.steps}
            enumKey={PAYMENT_STATUS_FLOW.enumKey}
          />
        ) : undefined
      }
      loading={paymentQuery.isLoading}
      error={paymentQuery.error}
      actionMenuItems={
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
              <DecimalDisplay
                value={payment.amount}
                suffix={payment.currency}
                groupDigits
                component="span"
              />
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
          extraTabs={
            canUpload
              ? [
                  {
                    value: 'details',
                    label: tCollab('tabs.details'),
                    panel: (
                      <PaymentUploadSection
                        companyId={companyId}
                        paymentId={payment.id}
                        invoiceId={payment.invoiceId}
                      />
                    ),
                  },
                ]
              : undefined
          }
        />
      ) : null}
    </DocumentDetailLayout>
  );
}
