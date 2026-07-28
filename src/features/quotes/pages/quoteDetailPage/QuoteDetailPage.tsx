import { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetQuoteQuery } from '@/api/endpoints/quotesApi';
import { useGetInboundRequestQuery } from '@/api/endpoints/requestsApi';
import { QuoteStatusBadge } from '@/components/QuoteStatusBadge';
import { DocumentDetailTabs } from '@/features/collaboration/components/documentDetailTabs/DocumentDetailTabs';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';
import { QuoteStatusActions } from '@/features/quotes/components/quoteStatusActions/QuoteStatusActions';
import { useAppSelector } from '@/hooks/useAppSelector';
import { QuoteHeaderForm } from '@/features/quotes/components/quoteHeaderForm/QuoteHeaderForm';
import { QuoteLinesTable } from '@/features/quotes/components/quoteLinesTable/QuoteLinesTable';

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
  const materialRequestId = quote?.materialRequest?.id;
  const materialRequestTitle = quote?.materialRequest?.title;

  const isSupplier = Boolean(
    quote && companyId && quote.supplierCompany?.id === companyId,
  );
  const isBuyer = Boolean(
    quote && companyId && quote.buyerCompany?.id === companyId,
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
            materialRequestId={quote.materialRequest?.id}
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
                  <Link
                    component={RouterLink}
                    to={requestLink}
                    underline="hover"
                  >
                    {isSupplier
                      ? t('detail.inboundRequest')
                      : t('detail.outboundRequest')}
                    :{' '}
                    {materialRequestTitle ?? '—'}
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
            {quote.validUntil && !canEdit ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <EventOutlinedIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {t('form.validUntil')}:{' '}
                  {new Date(quote.validUntil).toLocaleDateString()}
                </Typography>
              </Stack>
            ) : null}
            {quote.notes && !canEdit ? (
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <NotesOutlinedIcon fontSize="small" color="action" />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  whiteSpace="pre-wrap"
                >
                  {t('form.notes')}: {quote.notes}
                </Typography>
              </Stack>
            ) : null}
          </Stack>
        ) : null
      }
    >
      {quote && (isSupplier || isBuyer) ? (
        <Stack spacing={3}>
          <QuoteHeaderForm
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
                  <QuoteLinesTable
                    companyId={companyId}
                    quoteId={quote.id}
                    materialRequestId={quote.materialRequest?.id}
                    currency={quote.currency}
                    lines={quote.lines}
                    requestLines={requestLines}
                    editable={canEdit}
                  />
                ),
              },
            ]}
          />
        </Stack>
      ) : null}
    </DocumentDetailLayout>
  );
}
