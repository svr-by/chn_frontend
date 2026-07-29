import { Link as RouterLink, useParams } from 'react-router-dom';
import { Link, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { MaterialRequestStatus } from '@/api/generated/models/materialRequestStatus';
import { useGetQuoteComparisonQuery } from '@/api/endpoints/requestsApi';
import { StatusBadge } from '@/components/StatusBadge';
import { QuoteComparisonMatrix } from '@/features/quotes/components/quoteComparisonMatrix/QuoteComparisonMatrix';
import { useQuoteLineSelectionMap } from '@/features/quotes/hooks/useQuoteLineSelectionMap';
import { comparisonHasSelectableOffers } from '@/features/quotes/lib/buildQuoteComparisonRows';
import { SELECTABLE_REQUEST_STATUSES } from '@/features/quotes/lib/quoteSelection';
import { useAppSelector } from '@/hooks/useAppSelector';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';

export function QuoteComparisonPage() {
  const { t } = useTranslation('quotes');
  const { requestId } = useParams<{ requestId: string }>();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const comparisonQuery = useGetQuoteComparisonQuery(
    { companyId: companyId ?? '', requestId: requestId ?? '' },
    { skip: !companyId || !requestId },
  );

  const { selectionMap } = useQuoteLineSelectionMap(
    companyId ?? '',
    requestId ?? '',
  );

  const request = comparisonQuery.data?.request;
  const requestStatus = request?.status as MaterialRequestStatus | undefined;
  const selectionEnabled =
    requestStatus != null &&
    SELECTABLE_REQUEST_STATUSES.has(requestStatus) &&
    comparisonHasSelectableOffers(comparisonQuery.data?.lines ?? []);

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
        requestStatus ? <StatusBadge status={requestStatus} /> : undefined
      }
      loading={comparisonQuery.isLoading}
      backFallbackTo={`/app/requests/${requestId}`}
      meta={
        requestId ? (
          <Link component={RouterLink} to={`/app/requests/${requestId}`}>
            {t('comparison.backToRequest')}
          </Link>
        ) : null
      }
    >
      <Stack spacing={2}>
        <QuoteComparisonMatrix
          companyId={companyId}
          requestId={requestId}
          selectionEnabled={selectionEnabled}
          selectionMap={selectionMap}
        />
      </Stack>
    </DocumentDetailLayout>
  );
}
