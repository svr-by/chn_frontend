import { Button, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useGetQuoteComparisonQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PermissionGate } from '@/components/PermissionGate';
import { StatusBadge } from '@/components/StatusBadge';
import { QuoteComparisonMatrix } from '@/features/quotes/components/quoteComparisonMatrix/QuoteComparisonMatrix';
import { useOpenRequestSelection } from '@/features/selections/hooks/useOpenRequestSelection';
import { useAppSelector } from '@/hooks/useAppSelector';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';

export function QuoteComparisonPage() {
  const { t } = useTranslation(['quotes', 'selections']);
  const { requestId } = useParams<{ requestId: string }>();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const {
    openRequestSelection,
    isOpening,
    error: openSelectionError,
  } = useOpenRequestSelection();

  const comparisonQuery = useGetQuoteComparisonQuery(
    { companyId: companyId ?? '', requestId: requestId ?? '' },
    { skip: !companyId || !requestId },
  );

  const request = comparisonQuery.data?.request;

  if (!companyId || !requestId) {
    return null;
  }

  const title =
    request?.title ??
    t('comparison.fallbackTitle', { id: requestId.slice(0, 8) });

  return (
    <DocumentDetailLayout
      title={title}
      statusBadge={
        request?.status ? <StatusBadge status={request.status} /> : undefined
      }
      loading={comparisonQuery.isLoading}
      actions={
        requestId ? (
          <PermissionGate permission="manageSelections">
            <Button
              variant="contained"
              onClick={() => openRequestSelection(requestId)}
              disabled={isOpening}
            >
              {t('selections:actions.openSelection')}
            </Button>
          </PermissionGate>
        ) : null
      }
    >
      <Stack spacing={2}>
        <ApiErrorAlert error={openSelectionError} />
        <QuoteComparisonMatrix companyId={companyId} requestId={requestId} />
      </Stack>
    </DocumentDetailLayout>
  );
}
