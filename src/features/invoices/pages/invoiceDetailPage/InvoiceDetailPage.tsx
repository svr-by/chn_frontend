import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ListItemIcon, ListItemText, Stack } from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import {
  useGetInvoiceQuery,
  useGetShippableLinesQuery,
} from '@/api/endpoints/invoicesApi';
import { DocumentActionMenuItem } from '@/layouts/documentDetailLayout/DocumentDetailActionsMenu';
import {
  DocumentDetailMeta,
  DocumentDetailMetaItem,
  DocumentDetailMetaRow,
} from '@/layouts/documentDetailLayout/DocumentDetailMeta';
import { DocumentStatusProgress } from '@/components/DocumentStatusProgress';
import { PermissionGate } from '@/components/PermissionGate';
import { DocumentDetailTabs } from '@/features/collaboration/components/documentDetailTabs/DocumentDetailTabs';
import { DocumentDetailLayout } from '@/layouts/documentDetailLayout/DocumentDetailLayout';
import {
  InvoiceNotesEditButton,
  InvoiceNumberEditButton,
} from '@/features/invoices/components/invoiceHeaderForm/InvoiceHeaderForm';
import { InvoiceAmountSummary } from '@/features/invoices/components/InvoiceAmountSummary';
import { InvoiceLinesTable } from '@/features/invoices/components/invoiceLinesTable/InvoiceLinesTable';
import { InvoicePaymentsTable } from '@/features/invoices/components/InvoicePaymentsTable';
import { InvoiceStatusActions } from '@/features/invoices/components/InvoiceStatusActions';
import { requestIdsFromInvoiceLines } from '@/features/invoices/lib/invoicesFilters';
import { PaymentRegisterDialog } from '@/features/payments/components/PaymentRegisterDialog';
import { useCreateShippingInvoiceFromInvoice } from '@/features/shipping/hooks/useCreateShippingInvoiceFromInvoice';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';
import { SUPPLIER_INVOICE_STATUS_FLOW } from '@/lib/documentStatusFlows';

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
  const requestIds = useMemo(
    () => requestIdsFromInvoiceLines(invoice?.lines ?? []),
    [invoice?.lines],
  );
  const isSupplier = Boolean(
    invoice && companyId && invoice.supplierCompany?.id === companyId,
  );
  const canEdit = isSupplier && hasPermission('manageInvoices');
  const canRegisterPayment =
    invoice &&
    PAYMENT_ALLOWED_STATUSES.has(invoice.status) &&
    hasPermission('managePayments');
  const canCreateShipping =
    invoice &&
    SHIPPING_ALLOWED_STATUSES.has(invoice.status) &&
    hasPermission('manageShippingInvoices');
  const showPayments =
    invoice &&
    invoice.status !== 'DRAFT' &&
    (invoice.payments?.length ?? 0) > 0;

  const { createShippingInvoiceFromInvoice, isCreating: isCreatingShipping } =
    useCreateShippingInvoiceFromInvoice();

  const shippableQuery = useGetShippableLinesQuery(
    { companyId: companyId ?? '', invoiceId: invoiceId ?? '' },
    { skip: !companyId || !invoiceId || !canEdit },
  );

  const shippedQuantityByLineId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const line of shippableQuery.data?.lines ?? []) {
      map[line.invoiceLineId] = line.shippedQuantity;
    }
    return map;
  }, [shippableQuery.data?.lines]);

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

  const title = invoice?.number
    ? t('detail.titleWithNumber', { number: invoice.number })
    : t('detail.fallbackTitle', { id: invoiceId.slice(0, 8) });

  return (
    <DocumentDetailLayout
      title={title}
      titleAction={
        invoice && canEdit ? (
          <InvoiceNumberEditButton
            companyId={companyId}
            invoice={invoice}
          />
        ) : null
      }
      statusBadge={
        invoice?.status ? (
          <DocumentStatusProgress
            currentStatus={invoice.status}
            steps={SUPPLIER_INVOICE_STATUS_FLOW.steps}
            enumKey={SUPPLIER_INVOICE_STATUS_FLOW.enumKey}
          />
        ) : undefined
      }
      loading={invoiceQuery.isLoading}
      error={invoiceQuery.error}
      backFallbackTo="/app/invoices"
      actionMenuItems={
        invoice ? (
          <>
            <InvoiceStatusActions
              companyId={companyId}
              invoiceId={invoice.id}
              requestIds={requestIds}
              status={invoice.status}
            />
            {canRegisterPayment ? (
              <PermissionGate permission="managePayments">
                <DocumentActionMenuItem 
                  disabled={true}
                  onClick={() => setRegisterOpen(true)}
                >
                  <ListItemIcon>
                    <PaymentsOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{t('actions.registerPayment')}</ListItemText>
                </DocumentActionMenuItem>
              </PermissionGate>
            ) : null}
            {canCreateShipping ? (
              <PermissionGate permission="manageShippingInvoices">
                <DocumentActionMenuItem
                  // disabled={isCreatingShipping}
                  disabled={true}
                  onClick={() => createShippingInvoiceFromInvoice(invoice.id)}
                >
                  <ListItemIcon>
                    <LocalShippingOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>
                    {t('actions.createShippingInvoice')}
                  </ListItemText>
                </DocumentActionMenuItem>
              </PermissionGate>
            ) : null}
          </>
        ) : null
      }
      meta={
        invoice ? (
          <DocumentDetailMeta>
            <DocumentDetailMetaRow spacing={1.5}>
              <DocumentDetailMetaItem
                icon={<StorefrontOutlinedIcon />}
                value={t('detail.supplier', {
                  name: invoice.supplierCompany?.name ?? '—',
                })}
              />
              <DocumentDetailMetaItem
                icon={<BusinessOutlinedIcon />}
                value={t('detail.buyer', {
                  name: invoice.buyerCompany?.name ?? '—',
                })}
              />

              {invoice.issuedAt ? (
                <DocumentDetailMetaItem
                  icon={<ScheduleOutlinedIcon />}
                  value={t('detail.issuedAt', {
                    date: new Date(invoice.issuedAt).toLocaleDateString(),
                  })}
                />
              ) : null}
            </DocumentDetailMetaRow>

            <DocumentDetailMetaRow>
              <DocumentDetailMetaItem
                icon={<PaidOutlinedIcon />}
                label={t('form.currency')}
                value={invoice.currency}
              />
              {/* {showShippingLink ? (
                <DocumentDetailMetaItem
                  icon={<LocalShippingOutlinedIcon />}
                  label={t('detail.shipping')}
                  value={
                    <Link
                      component={RouterLink}
                      to={`/app/shipping-invoices?supplierInvoiceId=${invoice.id}`}
                      underline="hover"
                    >
                      {t('detail.viewShipping')}
                    </Link>
                  }
                />
              ) : null} */}
              {/* {invoice.status !== 'DRAFT' ? (
                <DocumentDetailMetaItem
                  icon={<PaymentsOutlinedIcon />}
                  label={t('detail.payments')}
                  value={
                    <Link
                      component={RouterLink}
                      to={`/app/payments?invoiceId=${invoice.id}`}
                      underline="hover"
                    >
                      {t('detail.viewPayments')}
                    </Link>
                  }
                />
              ) : null} */}
              {Boolean(invoice.notes) || canEdit ? (
                <DocumentDetailMetaItem
                  icon={<NotesOutlinedIcon />}
                  label={t('form.notes')}
                  value={invoice.notes ?? undefined}
                  valueClampLines={invoice.notes ? 2 : undefined}
                  action={
                    canEdit ? (
                      <InvoiceNotesEditButton
                        companyId={companyId}
                        invoice={invoice}
                      />
                    ) : null
                  }
                />
              ) : null}
            </DocumentDetailMetaRow>
          </DocumentDetailMeta>
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
                  {/* <InvoiceAmountSummary
                    totalAmount={invoice.totalAmount}
                    confirmedPaidAmount={invoice.confirmedPaidAmount}
                    remainingAmount={invoice.remainingAmount}
                    currency={invoice.currency}
                  /> */}
                  <InvoiceLinesTable
                    companyId={companyId}
                    invoiceId={invoice.id}
                    requestIds={requestIds}
                    buyerCompanyId={invoice.buyerCompany?.id}
                    currency={invoice.currency}
                    totalAmount={invoice.totalAmount}
                    lines={invoice.lines}
                    shippedQuantityByLineId={shippedQuantityByLineId}
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
