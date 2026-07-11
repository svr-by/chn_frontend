import { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetShippableLinesQuery } from '@/api/endpoints/invoicesApi';
import { useGetShippingInvoiceQuery } from '@/api/endpoints/shippingInvoicesApi';
import { ShippingInvoiceStatusBadge } from '@/components/ShippingInvoiceStatusBadge';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';
import { ShippingInvoiceHeaderForm } from '@/features/shipping/components/ShippingInvoiceHeaderForm';
import { ShippingInvoiceLinesTable } from '@/features/shipping/components/ShippingInvoiceLinesTable';
import { ShippingStatusActions } from '@/features/shipping/components/ShippingStatusActions';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';

export function ShippingInvoiceDetailPage() {
  const { t } = useTranslation('shipping');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { shippingInvoiceId } = useParams<{ shippingInvoiceId: string }>();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { hasPermission } = usePermissions();

  const shippingQuery = useGetShippingInvoiceQuery(
    { companyId: companyId ?? '', shippingInvoiceId: shippingInvoiceId ?? '' },
    { skip: !companyId || !shippingInvoiceId },
  );

  const shippingInvoice = shippingQuery.data?.shippingInvoice;
  const supplierInvoiceId = shippingInvoice?.supplierInvoiceId;
  const isDraft = shippingInvoice?.status === 'DRAFT';
  const canEdit = isDraft && hasPermission('manageShippingInvoices');

  const shippableQuery = useGetShippableLinesQuery(
    { companyId: companyId ?? '', invoiceId: supplierInvoiceId ?? '' },
    { skip: !companyId || !supplierInvoiceId || !canEdit },
  );

  useEffect(() => {
    if (
      shippingQuery.isError &&
      'status' in shippingQuery.error &&
      shippingQuery.error.status === 404
    ) {
      enqueueSnackbar(t('toast.notFound'), { variant: 'error' });
      navigate('/app/shipping-invoices', { replace: true });
    }
  }, [
    shippingQuery.isError,
    shippingQuery.error,
    enqueueSnackbar,
    navigate,
    t,
  ]);

  if (!companyId || !shippingInvoiceId) {
    return null;
  }

  const title = t('detail.fallbackTitle', {
    id: shippingInvoiceId.slice(0, 8),
  });

  return (
    <DocumentDetailLayout
      title={title}
      statusBadge={
        shippingInvoice?.status ? (
          <ShippingInvoiceStatusBadge status={shippingInvoice.status} />
        ) : undefined
      }
      backTo="/app/shipping-invoices"
      backLabel={t('actions.backToList')}
      loading={shippingQuery.isLoading}
      error={shippingQuery.error}
      actions={
        shippingInvoice ? (
          <ShippingStatusActions
            companyId={companyId}
            shippingInvoiceId={shippingInvoice.id}
            supplierInvoiceId={shippingInvoice.supplierInvoiceId}
            status={shippingInvoice.status}
          />
        ) : null
      }
      meta={
        shippingInvoice ? (
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {t('detail.supplier', {
                name: shippingInvoice.supplierCompany?.name ?? '—',
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('detail.buyer', {
                name: shippingInvoice.buyerCompany?.name ?? '—',
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('detail.supplierInvoice')}:{' '}
              <Link
                component={RouterLink}
                to={`/app/invoices/${shippingInvoice.supplierInvoiceId}`}
                underline="hover"
              >
                {shippingInvoice.supplierInvoiceId.slice(0, 8)}
              </Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('detail.request')}:{' '}
              <Link
                component={RouterLink}
                to={`/app/requests/${shippingInvoice.materialRequestId}`}
                underline="hover"
              >
                {shippingInvoice.materialRequestId.slice(0, 8)}
              </Link>
            </Typography>
            {shippingInvoice.trackingNumber ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.trackingNumber', {
                  value: shippingInvoice.trackingNumber,
                })}
              </Typography>
            ) : null}
            {shippingInvoice.carrier ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.carrier', { value: shippingInvoice.carrier })}
              </Typography>
            ) : null}
            {shippingInvoice.issuedAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.issuedAt', {
                  date: new Date(shippingInvoice.issuedAt).toLocaleString(),
                })}
              </Typography>
            ) : null}
            {shippingInvoice.inTransitAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.inTransitAt', {
                  date: new Date(shippingInvoice.inTransitAt).toLocaleString(),
                })}
              </Typography>
            ) : null}
            {shippingInvoice.deliveredAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.deliveredAt', {
                  date: new Date(shippingInvoice.deliveredAt).toLocaleString(),
                })}
              </Typography>
            ) : null}
          </Stack>
        ) : null
      }
    >
      {shippingInvoice ? (
        <Stack spacing={3}>
          <ShippingInvoiceHeaderForm
            companyId={companyId}
            shippingInvoice={shippingInvoice}
            editable={canEdit}
          />
          <ShippingInvoiceLinesTable
            companyId={companyId}
            shippingInvoiceId={shippingInvoice.id}
            supplierInvoiceId={shippingInvoice.supplierInvoiceId}
            lines={shippingInvoice.lines}
            shippableLines={shippableQuery.data?.lines ?? []}
            editable={canEdit}
          />
        </Stack>
      ) : null}
    </DocumentDetailLayout>
  );
}
