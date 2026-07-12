import { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetQuoteComparisonQuery } from '@/api/endpoints/requestsApi';
import { useGetSelectionQuery } from '@/api/endpoints/selectionsApi';
import { SelectionStatusBadge } from '@/components/SelectionStatusBadge';
import { DocumentDetailTabs } from '@/features/collaboration/components/DocumentDetailTabs';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';
import { SelectionHeaderForm } from '@/features/selections/components/SelectionHeaderForm';
import { SelectionLinesTable } from '@/features/selections/components/SelectionLinesTable';
import { SelectionStatusActions } from '@/features/selections/components/SelectionStatusActions';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';

export function SelectionDetailPage() {
  const { t } = useTranslation('selections');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { selectionId } = useParams<{ selectionId: string }>();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { hasPermission } = usePermissions();

  const selectionQuery = useGetSelectionQuery(
    { companyId: companyId ?? '', selectionId: selectionId ?? '' },
    { skip: !companyId || !selectionId },
  );

  const selection = selectionQuery.data?.selection;
  const materialRequestId = selection?.materialRequestId;
  const isDraft = selection?.status === 'DRAFT';
  const canEdit = isDraft && hasPermission('manageSelections');

  const comparisonQuery = useGetQuoteComparisonQuery(
    { companyId: companyId ?? '', requestId: materialRequestId ?? '' },
    { skip: !companyId || !materialRequestId || !canEdit },
  );

  useEffect(() => {
    if (
      selectionQuery.isError &&
      'status' in selectionQuery.error &&
      selectionQuery.error.status === 404
    ) {
      enqueueSnackbar(t('toast.notFound'), { variant: 'error' });
      navigate('/app/selections', { replace: true });
    }
  }, [
    selectionQuery.isError,
    selectionQuery.error,
    enqueueSnackbar,
    navigate,
    t,
  ]);

  if (!companyId || !selectionId) {
    return null;
  }

  const title = t('detail.fallbackTitle', { id: selectionId.slice(0, 8) });
  const request = selection?.materialRequest;

  return (
    <DocumentDetailLayout
      title={title}
      statusBadge={
        selection?.status ? (
          <SelectionStatusBadge status={selection.status} />
        ) : undefined
      }
      backTo="/app/selections"
      backLabel={t('actions.backToList')}
      loading={selectionQuery.isLoading}
      error={selectionQuery.error}
      actions={
        selection ? (
          <SelectionStatusActions
            companyId={companyId}
            selectionId={selection.id}
            materialRequestId={selection.materialRequestId}
            status={selection.status}
          />
        ) : null
      }
      meta={
        selection ? (
          <Stack spacing={0.5}>
            {materialRequestId ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.request')}:{' '}
                <Link
                  component={RouterLink}
                  to={`/app/requests/${materialRequestId}`}
                  underline="hover"
                >
                  {request?.title ?? materialRequestId.slice(0, 8)}
                </Link>
              </Typography>
            ) : null}
            {selection.confirmedAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.confirmedAt', {
                  date: new Date(selection.confirmedAt).toLocaleString(),
                })}
              </Typography>
            ) : null}
            {selection.cancelledAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.cancelledAt', {
                  date: new Date(selection.cancelledAt).toLocaleString(),
                })}
              </Typography>
            ) : null}
            {selection.status === 'CONFIRMED' && materialRequestId ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.invoices')}:{' '}
                <Link
                  component={RouterLink}
                  to={`/app/invoices?requestId=${materialRequestId}`}
                  underline="hover"
                >
                  {t('detail.viewInvoices')}
                </Link>
              </Typography>
            ) : null}
          </Stack>
        ) : null
      }
    >
      {selection ? (
        <DocumentDetailTabs
          companyId={companyId}
          documentType="PURCHASE_SELECTION"
          documentId={selection.id}
          details={
            <Stack spacing={3}>
              <SelectionHeaderForm
                companyId={companyId}
                selection={selection}
                editable={canEdit}
              />
              <SelectionLinesTable
                companyId={companyId}
                selectionId={selection.id}
                materialRequestId={selection.materialRequestId}
                lines={selection.lines}
                comparisonLines={comparisonQuery.data?.lines ?? []}
                editable={canEdit}
              />
            </Stack>
          }
        />
      ) : null}
    </DocumentDetailLayout>
  );
}
