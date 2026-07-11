import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Button, Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetBillableLinesQuery } from '@/api/endpoints/requestsApi';
import { useGetInvoiceQuery } from '@/api/endpoints/invoicesApi';
import { InvoiceStatusBadge } from '@/components/InvoiceStatusBadge';
import { PermissionGate } from '@/components/PermissionGate';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';
import { InvoiceAmountSummary } from '@/features/invoices/components/InvoiceAmountSummary';
import { InvoiceHeaderForm } from '@/features/invoices/components/InvoiceHeaderForm';
import { InvoiceLinesTable } from '@/features/invoices/components/InvoiceLinesTable';
import { InvoicePaymentsTable } from '@/features/invoices/components/InvoicePaymentsTable';
import { InvoiceStatusActions } from '@/features/invoices/components/InvoiceStatusActions';
import { PaymentRegisterDialog } from '@/features/payments/components/PaymentRegisterDialog';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';

const PAYMENT_ALLOWED_STATUSES = new Set(['ISSUED', 'PARTIALLY_PAID']);

export function InvoiceDetailPage() {
  const { t } = useTranslation('invoices');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { hasPermission } = usePermissions();
  const [registerOpen, setRegisterOpen] = useState(false);

  const invoiceQuery = useGetInvoiceQuery(
    { companyId: companyId ?? '', invoiceId: invoiceId ?? '' },
    { skip: !companyId || !invoiceId },
  );

  const invoice = invoiceQuery.data?.invoice;
  const materialRequestId = invoice?.materialRequestId;
  const isDraft = invoice?.status === 'DRAFT';
  const canEdit = isDraft && hasPermission('manageInvoices');
  const canRegisterPayment =
    invoice &&
    PAYMENT_ALLOWED_STATUSES.has(invoice.status) &&
    hasPermission('managePayments');

  const billableQuery = useGetBillableLinesQuery(
    { companyId: companyId ?? '', requestId: materialRequestId ?? '' },
    { skip: !companyId || !materialRequestId || !canEdit },
  );

  useEffect(() => {
    if (
      invoiceQuery.isError &&
      'status' in invoiceQuery.error &&
      invoiceQuery.error.status === 404
    ) {
      enqueueSnackbar(t('toast.notFound'), { variant: 'error' });
      navigate('/app/invoices', { replace: true });
    }
  }, [invoiceQuery.isError, invoiceQuery.error, enqueueSnackbar, navigate, t]);

  if (!companyId || !invoiceId) {
    return null;
  }

  const title = invoice?.invoiceNumber
    ? t('detail.titleWithNumber', { number: invoice.invoiceNumber })
    : t('detail.fallbackTitle', { id: invoiceId.slice(0, 8) });

  const showPayments =
    invoice &&
    invoice.status !== 'DRAFT' &&
    (invoice.payments?.length ?? 0) > 0;

  return (
    <DocumentDetailLayout
      title={title}
      statusBadge={
        invoice?.status ? (
          <InvoiceStatusBadge status={invoice.status} />
        ) : undefined
      }
      backTo="/app/invoices"
      backLabel={t('actions.backToList')}
      loading={invoiceQuery.isLoading}
      error={invoiceQuery.error}
      actions={
        invoice ? (
          <Stack direction="row" spacing={1}>
            <InvoiceStatusActions
              companyId={companyId}
              invoiceId={invoice.id}
              materialRequestId={invoice.materialRequestId}
              purchaseSelectionId={invoice.purchaseSelectionId}
              status={invoice.status}
            />
            {canRegisterPayment ? (
              <PermissionGate permission="managePayments">
                <Button variant="outlined" onClick={() => setRegisterOpen(true)}>
                  {t('actions.registerPayment')}
                </Button>
              </PermissionGate>
            ) : null}
          </Stack>
        ) : null
      }
      meta={
        invoice ? (
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {t('detail.supplier', {
                name: invoice.supplierCompany?.name ?? '—',
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('detail.buyer', { name: invoice.buyerCompany?.name ?? '—' })}
            </Typography>
            {materialRequestId ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.request')}:{' '}
                <Link
                  component={RouterLink}
                  to={`/app/requests/${materialRequestId}`}
                  underline="hover"
                >
                  {materialRequestId.slice(0, 8)}
                </Link>
              </Typography>
            ) : null}
            {invoice.purchaseSelectionId ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.selection')}:{' '}
                <Link
                  component={RouterLink}
                  to={`/app/selections/${invoice.purchaseSelectionId}`}
                  underline="hover"
                >
                  {invoice.purchaseSelectionId.slice(0, 8)}
                </Link>
              </Typography>
            ) : null}
            <InvoiceAmountSummary
              totalAmount={invoice.totalAmount}
              confirmedPaidAmount={invoice.confirmedPaidAmount}
              remainingAmount={invoice.remainingAmount}
              currency={invoice.currency}
            />
            {invoice.issuedAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.issuedAt', {
                  date: new Date(invoice.issuedAt).toLocaleString(),
                })}
              </Typography>
            ) : null}
            {invoice.confirmedAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.confirmedAt', {
                  date: new Date(invoice.confirmedAt).toLocaleString(),
                })}
              </Typography>
            ) : null}
            {invoice.status !== 'DRAFT' ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.payments')}:{' '}
                <Link
                  component={RouterLink}
                  to={`/app/payments?invoiceId=${invoice.id}`}
                  underline="hover"
                >
                  {t('detail.viewPayments')}
                </Link>
              </Typography>
            ) : null}
          </Stack>
        ) : null
      }
    >
      {invoice ? (
        <Stack spacing={3}>
          <InvoiceHeaderForm
            companyId={companyId}
            invoice={invoice}
            editable={canEdit}
          />
          <InvoiceLinesTable
            companyId={companyId}
            invoiceId={invoice.id}
            materialRequestId={invoice.materialRequestId}
            purchaseSelectionId={invoice.purchaseSelectionId}
            currency={invoice.currency}
            lines={invoice.lines}
            billableLines={billableQuery.data?.lines ?? []}
            editable={canEdit}
          />
          {showPayments ? (
            <InvoicePaymentsTable
              payments={invoice.payments ?? []}
              currency={invoice.currency}
            />
          ) : null}
        </Stack>
      ) : null}

      {invoice && canRegisterPayment ? (
        <PaymentRegisterDialog
          open={registerOpen}
          onClose={() => setRegisterOpen(false)}
          companyId={companyId}
          invoice={invoice}
        />
      ) : null}
    </DocumentDetailLayout>
  );
}
