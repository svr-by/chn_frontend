import { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetQuoteQuery } from '@/api/endpoints/quotesApi';
import { useGetInboundRequestQuery } from '@/api/endpoints/requestsApi';
import { QuoteStatusBadge } from '@/components/QuoteStatusBadge';
import { DocumentDetailTabs } from '@/features/collaboration/components/documentDetailTabs/DocumentDetailTabs';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';
import { QuoteStatusActions } from '@/features/quotes/components/QuoteStatusActions';
import { useAppSelector } from '@/hooks/useAppSelector';
import {
  QuoteCurrencyValidUntilFields,
  QuoteNotesField,
} from '../components/QuoteHeaderForm';
import { QuoteLinesTable } from '../components/QuoteLinesTable';

export function QuoteDetailPage() {
  const { t } = useTranslation('quotes');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { quoteId } = useParams<{ quoteId: string }>();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const quoteQuery = useGetQuoteQuery(
    { companyId: companyId ?? '', quoteId: quoteId ?? '' },
    { skip: !companyId || !quoteId },
  );

  const quote = quoteQuery.data?.quote;
  const materialRequestId = quote?.materialRequestId;
  const isSupplier = Boolean(
    quote && companyId && quote.supplierCompanyId === companyId,
  );
  const isBuyer = Boolean(
    quote && companyId && quote.buyerCompanyId === companyId,
  );

  const inboundRequestQuery = useGetInboundRequestQuery(
    { companyId: companyId ?? '', requestId: materialRequestId ?? '' },
    { skip: !companyId || !materialRequestId || !isSupplier },
  );

  useEffect(() => {
    if (
      quoteQuery.isError &&
      'status' in quoteQuery.error &&
      quoteQuery.error.status === 404
    ) {
      enqueueSnackbar(t('toast.notAvailable'), { variant: 'error' });
      navigate('/app/quotes', { replace: true });
    }
  }, [quoteQuery.isError, quoteQuery.error, enqueueSnackbar, navigate, t]);

  useEffect(() => {
    if (!quote || !companyId) {
      return;
    }

    if (!isSupplier && !isBuyer) {
      enqueueSnackbar(t('toast.notAvailable'), { variant: 'error' });
      navigate('/app/quotes', { replace: true });
    }
  }, [
    quote,
    companyId,
    isSupplier,
    isBuyer,
    enqueueSnackbar,
    navigate,
    t,
  ]);

  if (!companyId || !quoteId) {
    return null;
  }

  const title = quote
    ? t('detail.fallbackTitle', {
        date: new Date(quote.createdAt).toLocaleDateString(),
      })
    : '';
  const requestLines = isSupplier
    ? (inboundRequestQuery.data?.request.lines ?? [])
    : [];
  const canEdit =
    isSupplier &&
    (quote?.status === 'DRAFT' || quote?.status === 'SUBMITTED');
  const requestLink = materialRequestId
    ? isSupplier
      ? `/app/requests/inbound/${materialRequestId}`
      : `/app/requests/${materialRequestId}`
    : null;
  const counterpartyName = isSupplier
    ? quote?.buyerCompany?.name
    : quote?.supplierCompany?.name;
  const counterpartyLabel = isSupplier
    ? t('detail.buyer', { name: counterpartyName ?? '—' })
    : t('detail.supplier', { name: counterpartyName ?? '—' });

  return (
    <DocumentDetailLayout
      title={title}
      statusBadge={
        quote?.status ? <QuoteStatusBadge status={quote.status} /> : undefined
      }
      loading={quoteQuery.isLoading}
      error={quoteQuery.error}
      backFallbackTo="/app/quotes"
      actions={
        quote && isSupplier ? (
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
          <Stack spacing={0.75}>
            {counterpartyName ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <BusinessOutlinedIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {counterpartyLabel}
                </Typography>
              </Stack>
            ) : null}
            {requestLink ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <DescriptionOutlinedIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {t('detail.request')}:{' '}
                  <Link
                    component={RouterLink}
                    to={requestLink}
                    underline="hover"
                  >
                    {isSupplier
                      ? t('detail.inboundRequest')
                      : t('detail.outboundRequest')}
                  </Link>
                </Typography>
              </Stack>
            ) : null}
            {quote.submittedAt ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <ScheduleOutlinedIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {t('detail.submittedAt', {
                    date: new Date(quote.submittedAt).toLocaleDateString(),
                  })}
                </Typography>
              </Stack>
            ) : null}
          </Stack>
        ) : null
      }
    >
      {quote && (isSupplier || isBuyer) ? (
        <Stack spacing={3}>
          <QuoteCurrencyValidUntilFields
            companyId={companyId}
            quote={quote}
            editable={canEdit}
          />
          <DocumentDetailTabs
            companyId={companyId}
            documentType="SUPPLIER_QUOTE"
            documentId={quote.id}
            extraTabs={[
              {
                value: 'details',
                label: t('tabs.details'),
                panel: (
                  <Stack spacing={3}>
                    <QuoteLinesTable
                      companyId={companyId}
                      quoteId={quote.id}
                      materialRequestId={quote.materialRequestId}
                      currency={quote.currency}
                      lines={quote.lines}
                      requestLines={requestLines}
                      editable={canEdit}
                    />
                    <QuoteNotesField
                      companyId={companyId}
                      quote={quote}
                      editable={canEdit}
                    />
                  </Stack>
                ),
              },
            ]}
          />
        </Stack>
      ) : null}
    </DocumentDetailLayout>
  );
}
