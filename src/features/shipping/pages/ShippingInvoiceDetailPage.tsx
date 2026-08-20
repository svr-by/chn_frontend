import { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Link, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetShippableLinesQuery } from '@/api/endpoints/invoicesApi';
import { useGetShippingInvoiceQuery } from '@/api/endpoints/shippingInvoicesApi';
import { DocumentActionMenuItem } from '@/layouts/documentDetailLayout/DocumentDetailActionsMenu';
import { DocumentStatusProgress } from '@/components/status/documentStatusProgress/DocumentStatusProgress';
import { DocumentDetailTabs } from '@/features/collaboration/components/documentDetailTabs/DocumentDetailTabs';
import { DocumentDetailLayout } from '@/layouts/documentDetailLayout/DocumentDetailLayout';
import { ShippingInvoiceHeaderForm } from '@/features/shipping/components/ShippingInvoiceHeaderForm';
import { ShippingInvoiceLinesTable } from '@/features/shipping/components/ShippingInvoiceLinesTable';
import { ShippingStatusActions } from '@/features/shipping/components/ShippingStatusActions';
import { useCreateConsolidationFromShippingInvoice } from '@/features/consolidations/hooks/useCreateConsolidationFromShippingInvoice';
import { PermissionGate } from '@/components/auth/permissionGate/PermissionGate';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';
import { SHIPPING_INVOICE_STATUS_FLOW } from '@/lib/documentStatusFlows';

export function ShippingInvoiceDetailPage() {
  const { t } = useTranslation('shipping');
  const { t: tCollab } = useTranslation('collaboration');
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
  const supplierInvoiceId = shippingInvoice?.supplierInvoiceId;
  const isDraft = shippingInvoice?.status === 'DRAFT';
  const canEdit = isDraft && hasPermission('manageShippingInvoices');
  const canCreateConsolidation =
    shippingInvoice?.status === 'DELIVERED' &&
    hasPermission('manageConsolidations');
  const showConsolidationsLink = shippingInvoice?.status === 'DELIVERED';

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
          <DocumentStatusProgress
            currentStatus={shippingInvoice.status}
            steps={SHIPPING_INVOICE_STATUS_FLOW.steps}
            enumKey={SHIPPING_INVOICE_STATUS_FLOW.enumKey}
          />
        ) : undefined
      }
      loading={shippingQuery.isLoading}
      error={shippingQuery.error}
      actionMenuItems={
        shippingInvoice ? (
          <>
            <ShippingStatusActions
              companyId={companyId}
              shippingInvoiceId={shippingInvoice.id}
              supplierInvoiceId={shippingInvoice.supplierInvoiceId}
              status={shippingInvoice.status}
            />
            {canCreateConsolidation ? (
              <PermissionGate permission="manageConsolidations">
                <DocumentActionMenuItem
                  disabled={isCreating}
                  onClick={() =>
                    createConsolidationFromShippingInvoice(shippingInvoice.id)
                  }
                >
                  <ListItemIcon>
                    <Inventory2OutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>
                    {t('actions.createConsolidation')}
                  </ListItemText>
                </DocumentActionMenuItem>
              </PermissionGate>
            ) : null}
          </>
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
                {shippingInvoice.supplierInvoice?.number ??
                  shippingInvoice.supplierInvoiceId.slice(0, 8)}
              </Link>
            </Typography>
            {(() => {
              const requestIds = [
                ...new Set(
                  shippingInvoice.lines
                    .map((line) => line.requestLine?.requestId)
                    .filter((id): id is string => Boolean(id)),
                ),
              ];
              if (requestIds.length === 0) {
                return null;
              }
              return (
                <Typography variant="body2" color="text.secondary">
                  {t('detail.requests')}:{' '}
                  {requestIds.map((requestId, index) => (
                    <span key={requestId}>
                      {index > 0 ? ', ' : null}
                      <Link
                        component={RouterLink}
                        to={`/app/requests/${requestId}`}
                        underline="hover"
                      >
                        {requestId.slice(0, 8)}
                      </Link>
                    </span>
                  ))}
                </Typography>
              );
            })()}
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
          extraTabs={[
            {
              value: 'details',
              label: tCollab('tabs.details'),
              panel: (
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
              ),
            },
          ]}
        />
      ) : null}
    </DocumentDetailLayout>
  );
}
