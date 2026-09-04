import { Link as RouterLink } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { DecimalDisplay } from '@/components/dataDisplay/decimalDisplay/DecimalDisplay';
import { QuoteOfferDecisionCell } from '@/features/quotes/components/quoteOfferDecision/QuoteOfferDecisionCell';
import type { OfferSelectionProps } from '@/features/quotes/components/quoteComparisonMatrix/QuoteComparisonMatrix';
import type { QuoteComparisonOfferRow } from '@/features/quotes/lib/buildQuoteComparisonRows';
import { formatQuoteDate } from '@/features/quotes/lib/quoteComparisonSelection';

interface OfferCardDetailsProps extends OfferSelectionProps {
  row: QuoteComparisonOfferRow;
  unit?: string | null;
}

export function OfferCardDetails({
  row,
  companyId,
  selectionEnabled,
  allowRejectOffers,
  materialRequestId,
  unit,
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
        <DecimalDisplay value={offer.unitPrice} suffix={offer.currency} groupDigits />
      </Typography>
      <Typography variant="body2">
        {t('comparison.columns.offerQuantity')}:{' '}
        <DecimalDisplay value={offer.quantity} />
      </Typography>
      <Typography variant="body2">
        {t('comparison.columns.total')}:{' '}
        <DecimalDisplay value={offer.lineTotal} suffix={offer.currency} groupDigits />
      </Typography>
      {offer.leadTime != null && offer.leadTimeUnit ? (
        <Typography variant="body2">
          {t('comparison.columns.leadTime')}: {offer.leadTime}{' '}
          {t(`enums:leadTimeUnit.${offer.leadTimeUnit.toLowerCase()}`)}
        </Typography>
      ) : null}
      {offer.notes?.trim() ? (
        <Typography variant="body2">
          {t('comparison.columns.notes')}: {offer.notes.trim()}
        </Typography>
      ) : null}
      <QuoteOfferDecisionCell
        companyId={companyId}
        quoteId={offer.quoteId}
        lineId={offer.quoteLineId}
        maxQuantity={offer.quantity}
        selectedQuantity={offer.selectedQuantity}
        rejectedAt={offer.rejectedAt}
        rejectionReason={offer.rejectionReason}
        unit={unit}
        materialRequestId={materialRequestId}
        selectionEnabled={selectionEnabled}
        allowReject={allowRejectOffers}
      />
    </Stack>
  );
}
