import { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Link } from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetQuoteQuery, useGetQuoteBillableLinesQuery } from '@/api/endpoints/quotesApi';
import {
  useGetInboundRequestQuery,
  useGetRequestQuery,
} from '@/api/endpoints/requestsApi';
import {
  DocumentDetailMeta,
  DocumentDetailMetaItem,
  DocumentDetailMetaRow,
} from '@/layouts/documentDetailLayout/DocumentDetailMeta';
import { DocumentStatusProgress } from '@/components/status/documentStatusProgress/DocumentStatusProgress';
import { DocumentDetailTabs } from '@/features/collaboration/components/documentDetailTabs/DocumentDetailTabs';
import { DocumentDetailLayout } from '@/layouts/documentDetailLayout/DocumentDetailLayout';
import {
  QuoteHeaderActions,
  QuoteStatusActions,
} from '@/features/quotes/components/quoteStatusActions/QuoteStatusActions';
import { useAppSelector } from '@/hooks/useAppSelector';
import {
  QuoteCurrencyEditButton,
  QuoteNotesEditButton,
  QuoteNumberEditButton,
  QuoteValidUntilEditButton,
} from '@/features/quotes/components/quoteHeaderForm/QuoteHeaderForm';
import { QuoteLinesTable } from '@/features/quotes/components/quoteLinesTable/QuoteLinesTable';
import {
  isQuoteLineSelectionAllowed,
  SUPPLIER_EDITABLE_QUOTE_STATUSES,
} from '@/features/quotes/lib/quoteSelection';
import { usePermissions } from '@/hooks/usePermissions';
import { SUPPLIER_QUOTE_STATUS_FLOW } from '@/lib/documentStatusFlows';
import type { SupplierQuoteStatus } from '@/api/generated/models/supplierQuoteStatus';

const CSV_IMPORTABLE_QUOTE_STATUSES = new Set<SupplierQuoteStatus>([
  'DRAFT',
  'SUBMITTED',
]);

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

  const outboundRequestQuery = useGetRequestQuery(
    { companyId: companyId ?? '', requestId: materialRequestId ?? '' },
    { skip: !companyId || !materialRequestId || !isBuyer },
  );

  const billableQuery = useGetQuoteBillableLinesQuery(
    {
      companyId: companyId ?? '',
      quoteId: quoteId ?? '',
      materialRequestId: materialRequestId,
    },
    { skip: !companyId || !quoteId || !isSupplier },
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

  const title = t('detail.titleWithNumber', { number: quote?.number ?? '' });

  const requestLines = isSupplier
    ? (inboundRequestQuery.data?.request.lines ?? [])
    : [];
  const requestStatus = isBuyer
    ? outboundRequestQuery.data?.request.status
    : undefined;
  const canEdit =
    isSupplier &&
    quote?.status != null &&
    SUPPLIER_EDITABLE_QUOTE_STATUSES.has(quote.status);
  const hasSelections = quote?.lines.some(
    (line) => line.selectedQuantity != null,
  );
  const hasBillableLines = (billableQuery.data?.lines.length ?? 0) > 0;
  const canCreateInvoice =
    isSupplier &&
    hasPermission('manageInvoices') &&
    Boolean(materialRequestId) &&
    hasBillableLines;
  const canExportCsv = isSupplier && Boolean(materialRequestId);
  const canImportCsv =
    isSupplier &&
    quote?.status != null &&
    CSV_IMPORTABLE_QUOTE_STATUSES.has(quote.status) &&
    hasPermission('manageQuotes') &&
    Boolean(materialRequestId);
  const selectionEnabled =
    isBuyer &&
    quote?.status != null &&
    isQuoteLineSelectionAllowed(quote.status, requestStatus);
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
      titleAction={
        quote && canEdit ? (
          <QuoteNumberEditButton companyId={companyId} quote={quote} />
        ) : null
      }
      statusBadge={
        quote?.status ? (
          <DocumentStatusProgress
            currentStatus={quote.status}
            steps={SUPPLIER_QUOTE_STATUS_FLOW.steps}
            enumKey={SUPPLIER_QUOTE_STATUS_FLOW.enumKey}
          />
        ) : undefined
      }
      loading={quoteQuery.isLoading}
      error={quoteQuery.error}
      backFallbackTo="/app/quotes"
      headerActions={
        quote && isSupplier ? (
          <QuoteHeaderActions
            companyId={companyId}
            quoteId={quote.id}
            materialRequestId={quote.materialRequest?.id}
            status={quote.status}
            canCreateInvoice={canCreateInvoice}
          />
        ) : null
      }
      actionMenuItems={
        quote && isSupplier ? (
          <QuoteStatusActions
            companyId={companyId}
            quoteId={quote.id}
            materialRequestId={quote.materialRequest?.id}
            status={quote.status}
            hasSelections={hasSelections}
          />
        ) : null
      }
      meta={
        quote ? (
          <DocumentDetailMeta>
            <DocumentDetailMetaRow spacing={1.5}>
              {requestLink ? (
                <DocumentDetailMetaItem
                  icon={<DescriptionOutlinedIcon />}
                  value={
                    <Link
                      component={RouterLink}
                      to={requestLink}
                      underline="hover"
                    >
                      {t('detail.request')}{' '}
                      {materialRequestTitle ?? '—'}
                    </Link>
                  }
                />
              ) : null}
              {counterpartyName ? (
                <DocumentDetailMetaItem
                  icon={<BusinessOutlinedIcon />}
                  value={counterpartyLabel}
                />
              ) : null}
              {quote.submittedAt ? (
                <DocumentDetailMetaItem
                  icon={<ScheduleOutlinedIcon />}
                  value={t('detail.submittedAt', {
                    date: new Date(quote.submittedAt).toLocaleDateString(),
                  })}
                />
              ) : null}
            </DocumentDetailMetaRow>

            <DocumentDetailMetaRow>
              <DocumentDetailMetaItem
                icon={<PaidOutlinedIcon />}
                label={t('form.currency')}
                value={quote.currency}
                action={
                  canEdit && !hasSelections ? (
                    <QuoteCurrencyEditButton
                      companyId={companyId}
                      quote={quote}
                    />
                  ) : null
                }
              />
              {Boolean(quote.validUntil) || canEdit ? (
                <DocumentDetailMetaItem
                  icon={<EventOutlinedIcon />}
                  label={t('form.validUntil')}
                  value={
                    quote.validUntil
                      ? new Date(quote.validUntil).toLocaleDateString()
                      : undefined
                  }
                  action={
                    canEdit ? (
                      <QuoteValidUntilEditButton
                        companyId={companyId}
                        quote={quote}
                      />
                    ) : null
                  }
                />
              ) : null}
              {Boolean(quote.notes) || canEdit ? (
                <DocumentDetailMetaItem
                  icon={<NotesOutlinedIcon />}
                  label={t('form.notes')}
                  value={quote.notes ?? undefined}
                  valueClampLines={quote.notes ? 2 : undefined}
                  action={
                    canEdit ? (
                      <QuoteNotesEditButton
                        companyId={companyId}
                        quote={quote}
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
      {quote && (isSupplier || isBuyer) ? (
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
                  selectionMode={isBuyer ? 'buyer' : 'supplier'}
                  selectionEnabled={selectionEnabled}
                  canExportCsv={canExportCsv}
                  canImportCsv={canImportCsv}
                />
              ),
            },
          ]}
        />
      ) : null}
    </DocumentDetailLayout>
  );
}
