import { Link as RouterLink } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { DecimalDisplay } from '@/components/DecimalDisplay';
import { DecimalWithSuffix } from '@/components/DecimalWithSuffix';
import { QuoteLineSelectionCell } from '@/features/quotes/components/quoteLineSelection/QuoteLineSelectionCell';
import type { OfferSelectionProps } from '@/features/quotes/components/quoteComparisonMatrix/QuoteComparisonMatrix';
import type { QuoteComparisonOfferRow } from '@/features/quotes/lib/buildQuoteComparisonRows';
import {
  formatQuoteDate,
  resolveSelectedQuantity,
} from '@/features/quotes/lib/quoteComparisonSelection';

interface OfferCardDetailsProps extends OfferSelectionProps {
  row: QuoteComparisonOfferRow;
}

export function OfferCardDetails({
  row,
  companyId,
  selectionEnabled,
  materialRequestId,
}: OfferCardDetailsProps) {
  const { t } = useTranslation(['quotes', 'enums']);
  const { offer } = row;

  return (
    <Stack spacing={0.25}>
      {row.variantIndex != null ? (
        <Typography variant="caption" color="text.secondary">
          {t('comparison.cell.variant', { index: row.variantIndex })}
        </Typography>
      ) : null}
      <Typography variant="body2">
        <Link
          component={RouterLink}
          to={`/app/quotes/${offer.quoteId}`}
          underline="hover"
        >
          {formatQuoteDate(offer.createdAt)}
        </Link>
      </Typography>
      <Typography variant="body2">
        {t('comparison.columns.unitPrice')}:{' '}
        <DecimalWithSuffix value={offer.unitPrice} suffix={offer.currency} />
      </Typography>
      <Typography variant="body2">
        {t('comparison.columns.offerQuantity')}:{' '}
        <DecimalDisplay value={offer.quantity} />
      </Typography>
      <Typography variant="body2">
        {t('comparison.columns.total')}:{' '}
        <DecimalWithSuffix value={offer.lineTotal} suffix={offer.currency} />
      </Typography>
      {offer.leadTime != null && offer.leadTimeUnit ? (
        <Typography variant="body2">
          {t('comparison.columns.leadTime')}: {offer.leadTime}{' '}
          {t(`enums:leadTimeUnit.${offer.leadTimeUnit.toLowerCase()}`)}
        </Typography>
      ) : null}
      <QuoteLineSelectionCell
        companyId={companyId}
        quoteId={offer.quoteId}
        lineId={offer.quoteLineId}
        maxQuantity={offer.quantity}
        selectedQuantity={resolveSelectedQuantity(offer)}
        materialRequestId={materialRequestId}
        disabled={!selectionEnabled}
      />
    </Stack>
  );
}
