import { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Button, Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetShippingInvoiceQuery } from '@/api/endpoints/shippingInvoicesApi';
import { ShippingInvoiceStatusBadge } from '@/components/ShippingInvoiceStatusBadge';
import { DocumentDetailTabs } from '@/features/collaboration/components/documentDetailTabs/DocumentDetailTabs';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';
import { ShippingStatusActions } from '@/features/shipping/components/ShippingStatusActions';
import { useCreateConsolidationFromShippingInvoice } from '@/features/consolidations/hooks/useCreateConsolidationFromShippingInvoice';
import { PermissionGate } from '@/components/PermissionGate';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';

export function ShippingInvoiceDetailPage() {
  const { t } = useTranslation('shipping');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { shippingInvoiceId } = useParams<{ shippingInvoiceId: string }>();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { hasPermission } = usePermissions();
  const { createConsolidationFromShippingInvoice, isCreating } =
    useCreateConsolidationFromShippingInvoice();

  const shippingQuery = useGetShippingInvoiceQuery(
    { companyId: companyId ?? '', shippingInvoiceId: shippingInvoiceId ?? '' },
    { skip: !companyId || !shippingInvoiceId },
  );

  const shippingInvoice = shippingQuery.data?.shippingInvoice;
  const canCreateConsolidation =
    shippingInvoice?.status === 'DELIVERED' &&
    hasPermission('manageConsolidations');
  const showConsolidationsLink = shippingInvoice?.status === 'DELIVERED';

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
      loading={shippingQuery.isLoading}
      error={shippingQuery.error}
      actions={
        shippingInvoice ? (
          <Stack direction="row" spacing={1}>
            <ShippingStatusActions
              companyId={companyId}
              shippingInvoiceId={shippingInvoice.id}
              supplierInvoiceId={shippingInvoice.supplierInvoiceId}
              status={shippingInvoice.status}
            />
            {canCreateConsolidation ? (
              <PermissionGate permission="manageConsolidations">
                <Button
                  variant="outlined"
                  onClick={() =>
                    createConsolidationFromShippingInvoice(shippingInvoice.id)
                  }
                  disabled={isCreating}
                >
                  {t('actions.createConsolidation')}
                </Button>
              </PermissionGate>
            ) : null}
          </Stack>
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
            {showConsolidationsLink ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.consolidations')}:{' '}
                <Link
                  component={RouterLink}
                  to="/app/consolidations"
                  underline="hover"
                >
                  {t('detail.viewConsolidations')}
                </Link>
              </Typography>
            ) : null}
          </Stack>
        ) : null
      }
    >
      {shippingInvoice ? (
        <DocumentDetailTabs
          companyId={companyId}
          documentType="SHIPPING_INVOICE"
          documentId={shippingInvoice.id}
          // lineageEntries={shippingInvoice.lines.map(mapNestedRequestLineToLineageEntry)}
          // details={
          //   <Stack spacing={3}>
          //     <ShippingInvoiceHeaderForm
          //       companyId={companyId}
          //       shippingInvoice={shippingInvoice}
          //       editable={canEdit}
          //     />
          //     <ShippingInvoiceLinesTable
          //       companyId={companyId}
          //       shippingInvoiceId={shippingInvoice.id}
          //       supplierInvoiceId={shippingInvoice.supplierInvoiceId}
          //       lines={shippingInvoice.lines}
          //       shippableLines={shippableQuery.data?.lines ?? []}
          //       editable={canEdit}
          //     />
          //   </Stack>
          // }
        />
      ) : null}
    </DocumentDetailLayout>
  );
}
