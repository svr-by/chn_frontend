import { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetQuoteQuery } from '@/api/endpoints/quotesApi';
import { useGetRequestQuery } from '@/api/endpoints/requestsApi';
import { QuoteStatusBadge } from '@/components/QuoteStatusBadge';
import { DocumentDetailTabs } from '@/features/collaboration/components/documentDetailTabs/DocumentDetailTabs';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';
import { QuoteHeaderForm } from '@/features/quotes/components/QuoteHeaderForm';
import { QuoteLinesTable } from '@/features/quotes/components/QuoteLinesTable';
import { QuoteStatusActions } from '@/features/quotes/components/QuoteStatusActions';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';
import { mapNestedRequestLineToLineageEntry } from '@/lib/lineageEntries';

export function QuoteDetailPage() {
  const { t } = useTranslation('quotes');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { quoteId } = useParams<{ quoteId: string }>();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { hasPermission } = usePermissions();

  const quoteQuery = useGetQuoteQuery(
    { companyId: companyId ?? '', quoteId: quoteId ?? '' },
    { skip: !companyId || !quoteId },
  );

  const quote = quoteQuery.data?.quote;
  const materialRequestId = quote?.materialRequestId;

  const requestQuery = useGetRequestQuery(
    { companyId: companyId ?? '', requestId: materialRequestId ?? '' },
    { skip: !companyId || !materialRequestId },
  );

  const isDraft = quote?.status === 'DRAFT';
  const canEdit = isDraft && hasPermission('manageQuotes');

  useEffect(() => {
    if (
      quoteQuery.isError &&
      'status' in quoteQuery.error &&
      quoteQuery.error.status === 404
    ) {
      enqueueSnackbar(t('toast.notFound'), { variant: 'error' });
      navigate('/app/quotes', { replace: true });
    }
  }, [quoteQuery.isError, quoteQuery.error, enqueueSnackbar, navigate, t]);

  if (!companyId || !quoteId) {
    return null;
  }

  const title = t('detail.fallbackTitle', { id: quoteId.slice(0, 8) });
  const request = requestQuery.data?.request;

  return (
    <DocumentDetailLayout
      title={title}
      statusBadge={
        quote?.status ? <QuoteStatusBadge status={quote.status} /> : undefined
      }
      loading={quoteQuery.isLoading}
      error={quoteQuery.error}
      actions={
        quote ? (
          <QuoteStatusActions
            companyId={companyId}
            quoteId={quote.id}
            materialRequestId={quote.materialRequestId}
            status={quote.status}
          />
        ) : null
      }
      meta={
        quote ? (
          <Stack spacing={0.5}>
            {quote.buyerCompany ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.buyer', { name: quote.buyerCompany.name })}
              </Typography>
            ) : null}
            {materialRequestId ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.request')}:{' '}
                <Link
                  component={RouterLink}
                  to={`/app/requests/${materialRequestId}`}
                  underline="hover"
                >
                  {request?.reference ?? request?.title ?? materialRequestId.slice(0, 8)}
                </Link>
              </Typography>
            ) : null}
            {quote.submittedAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.submittedAt', {
                  date: new Date(quote.submittedAt).toLocaleString(),
                })}
              </Typography>
            ) : null}
            <Typography variant="body2" color="text.secondary">
              {t('detail.createdAt', {
                date: new Date(quote.createdAt).toLocaleString(),
              })}
            </Typography>
          </Stack>
        ) : null
      }
    >
      {quote ? (
        <DocumentDetailTabs
          companyId={companyId}
          documentType="SUPPLIER_QUOTE"
          documentId={quote.id}
          // lineageEntries={quote.lines.map(mapNestedRequestLineToLineageEntry)}
          // details={
          //   <Stack spacing={4}>
          //     <QuoteHeaderForm
          //       companyId={companyId}
          //       quote={quote}
          //       editable={canEdit}
          //     />
          //     <QuoteLinesTable
          //       companyId={companyId}
          //       quoteId={quote.id}
          //       materialRequestId={quote.materialRequestId}
          //       lines={quote.lines}
          //       requestLines={request?.lines ?? []}
          //       editable={canEdit}
          //     />
          //   </Stack>
          // }
        />
      ) : null}
    </DocumentDetailLayout>
  );
}
