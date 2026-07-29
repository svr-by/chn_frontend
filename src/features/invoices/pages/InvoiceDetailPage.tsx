import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Button, Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetQuoteBillableLinesQuery } from '@/api/endpoints/quotesApi';
import { useGetInvoiceQuery } from '@/api/endpoints/invoicesApi';
import { InvoiceStatusBadge } from '@/components/InvoiceStatusBadge';
import { PermissionGate } from '@/components/PermissionGate';
import { DocumentDetailTabs } from '@/features/collaboration/components/documentDetailTabs/DocumentDetailTabs';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';
import { InvoiceAmountSummary } from '@/features/invoices/components/InvoiceAmountSummary';
import { InvoiceHeaderForm } from '@/features/invoices/components/InvoiceHeaderForm';
import { InvoiceLinesTable } from '@/features/invoices/components/InvoiceLinesTable';
import { InvoicePaymentsTable } from '@/features/invoices/components/InvoicePaymentsTable';
import { InvoiceStatusActions } from '@/features/invoices/components/InvoiceStatusActions';
import { useSupplierQuoteForRequest } from '@/features/invoices/hooks/useSupplierQuoteForRequest';
import { PaymentRegisterDialog } from '@/features/payments/components/PaymentRegisterDialog';
import { useCreateShippingInvoiceFromInvoice } from '@/features/shipping/hooks/useCreateShippingInvoiceFromInvoice';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';

const PAYMENT_ALLOWED_STATUSES = new Set(['ISSUED', 'PARTIALLY_PAID']);
const SHIPPING_ALLOWED_STATUSES = new Set([
  'ISSUED',
  'PARTIALLY_PAID',
  'PAID',
  'CONFIRMED',
]);

export function InvoiceDetailPage() {
  const { t } = useTranslation('invoices');
  const { t: tCollab } = useTranslation('collaboration');
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
  const materialRequestId = invoice?.materialRequest?.id;
  const isDraft = invoice?.status === 'DRAFT';
  const canEdit = isDraft && hasPermission('manageInvoices');
  const canRegisterPayment =
    invoice &&
    PAYMENT_ALLOWED_STATUSES.has(invoice.status) &&
    hasPermission('managePayments');
  const canCreateShipping =
    invoice &&
    SHIPPING_ALLOWED_STATUSES.has(invoice.status) &&
    hasPermission('manageShippingInvoices');
  const showShippingLink =
    invoice && SHIPPING_ALLOWED_STATUSES.has(invoice.status);
  const showPayments =
    invoice &&
    invoice.status !== 'DRAFT' &&
    (invoice.payments?.length ?? 0) > 0;

  const { createShippingInvoiceFromInvoice, isCreating: isCreatingShipping } =
    useCreateShippingInvoiceFromInvoice();

  const { quoteId } = useSupplierQuoteForRequest(
    companyId ?? '',
    materialRequestId,
    canEdit,
  );

  const billableQuery = useGetQuoteBillableLinesQuery(
    { companyId: companyId ?? '', quoteId: quoteId ?? '' },
    { skip: !companyId || !quoteId || !canEdit },
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

  return (
    <DocumentDetailLayout
      title={title}
      statusBadge={
        invoice?.status ? (
          <InvoiceStatusBadge status={invoice.status} />
        ) : undefined
      }
      loading={invoiceQuery.isLoading}
      error={invoiceQuery.error}
      actions={
        invoice ? (
          <Stack direction="row" spacing={1}>
            <InvoiceStatusActions
              companyId={companyId}
              invoiceId={invoice.id}
              materialRequestId={materialRequestId}
              quoteId={quoteId}
              status={invoice.status}
            />
            {canRegisterPayment ? (
              <PermissionGate permission="managePayments">
                <Button
                  variant="outlined"
                  onClick={() => setRegisterOpen(true)}
                >
                  {t('actions.registerPayment')}
                </Button>
              </PermissionGate>
            ) : null}
            {canCreateShipping ? (
              <PermissionGate permission="manageShippingInvoices">
                <Button
                  variant="outlined"
                  disabled={isCreatingShipping}
                  onClick={() => createShippingInvoiceFromInvoice(invoice.id)}
                >
                  {t('actions.createShippingInvoice')}
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
                  {invoice.materialRequest?.title ?? materialRequestId.slice(0, 8)}
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
            {showShippingLink ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.shipping')}:{' '}
                <Link
                  component={RouterLink}
                  to={`/app/shipping-invoices?supplierInvoiceId=${invoice.id}`}
                  underline="hover"
                >
                  {t('detail.viewShipping')}
                </Link>
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
        <DocumentDetailTabs
          companyId={companyId}
          documentType="INVOICE"
          documentId={invoice.id}
          extraTabs={[
            {
              value: 'details',
              label: tCollab('tabs.details'),
              panel: (
                <Stack spacing={3}>
                  <InvoiceHeaderForm
                    companyId={companyId}
                    invoice={invoice}
                    editable={canEdit}
                    quoteId={quoteId}
                  />
                  <InvoiceLinesTable
                    companyId={companyId}
                    invoiceId={invoice.id}
                    materialRequestId={materialRequestId ?? ''}
                    quoteId={quoteId}
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
              ),
            },
          ]}
        />
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
