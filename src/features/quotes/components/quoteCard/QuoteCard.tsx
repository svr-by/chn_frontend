import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { GetCompaniesCompanyIdQuotesDirection } from '@/api/generated/models/getCompaniesCompanyIdQuotesDirection';
import type { SupplierQuoteSummary } from '@/api/generated/models/supplierQuoteSummary';
import { QuoteStatusBadge } from '@/components/status/quoteStatusBadge/QuoteStatusBadge';
import { DecimalDisplay } from '@/components/dataDisplay/decimalDisplay/DecimalDisplay';
import { DocumentListItemLayout } from '@/components/layouts/documentListItemLayout/DocumentListItemLayout';
import { formatLocalizedDate } from '@/lib/dateFormat';

interface QuoteCardProps {
  quote: SupplierQuoteSummary;
  direction: GetCompaniesCompanyIdQuotesDirection;
  onClick: () => void;
}

export function QuoteCard({ quote, direction, onClick }: QuoteCardProps) {
  const { t, i18n } = useTranslation('quotes');
  const isBuyerView = direction === 'inbound';

  const counterpartyName = isBuyerView
  ? quote.supplierCompany?.name ?? '—'
  : quote.buyerCompany?.name ?? '—';
  
  const numberText = t('detail.titleWithNumber', { number: quote.number ?? '—' });
  const createdByName = quote.createdByUser?.name ?? '—';
  const createdAtText = formatLocalizedDate(quote.createdAt, i18n.language);
  const validUntilText = formatLocalizedDate(quote.validUntil, i18n.language);

  return (
    <DocumentListItemLayout
      onClick={onClick}
      content={
        <>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {numberText}
          </Typography>

          <Typography variant="subtitle2" fontWeight={500} noWrap>
            {counterpartyName}
          </Typography>

          <Typography variant="body1" noWrap>
            <DecimalDisplay value={quote.positionsTotal} suffix={quote.currency} groupDigits /> {' · '}
            {`${t('columns.linesCount')}: ${quote.linesCount}`}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {`${createdAtText} · ${createdByName}`}
            {quote.validUntil ? ` · ${t('columns.validUntil')}: ${validUntilText}` : ''}
          </Typography>
        </>
      }
      aside={<QuoteStatusBadge status={quote.status} />}
    />
  );
}
