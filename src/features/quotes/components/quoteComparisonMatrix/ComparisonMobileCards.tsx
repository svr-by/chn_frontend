import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

import { DecimalDisplay } from '@/components/DecimalDisplay';
import { LineRowActionsMenu } from '@/components/LineRowActionsMenu';
import { OfferCardDetails } from '@/features/quotes/components/quoteComparisonMatrix/OfferCardDetails';
import type { OfferSelectionProps } from '@/features/quotes/components/quoteComparisonMatrix/QuoteComparisonMatrix';
import type { QuoteComparisonLineRow } from '@/features/quotes/lib/buildQuoteComparisonRows';
import {
  hasSelectedQuantity,
  lineIsOverOrdered,
  sumLineSelectedQuantity,
} from '@/features/quotes/lib/quoteComparisonSelection';

interface ComparisonMobileCardsProps extends OfferSelectionProps {
  rows: QuoteComparisonLineRow[];
}

export function ComparisonMobileCards({
  rows,
  companyId,
  selectionEnabled,
  materialRequestId,
}: ComparisonMobileCardsProps) {
  const { t } = useTranslation('quotes');

  return (
    <Stack spacing={1}>
      {rows.map((lineRow) => {
        const hasLineOffers = lineRow.offers.length > 0;
        const selectedTotal = sumLineSelectedQuantity(lineRow);
        const header = (
          <Stack spacing={0.5} sx={{ width: '100%', pr: 1 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <LineRowActionsMenu
                lineageId={lineRow.requestLine.lineageId}
                moreLabel={t('actions.more')}
                openTraceLabel={t('actions.openTrace')}
              />
              <Typography variant="subtitle2">
                #{lineRow.requestLine.lineNumber}
              </Typography>
              <Typography variant="body1" sx={{ flex: 1 }}>
                {lineRow.requestLine.description}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {t('comparison.columns.quantity')}:{' '}
              <DecimalDisplay
                value={lineRow.requestLine.quantity}
                suffix={lineRow.requestLine.unit ?? '—'}
              />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('columns.selectedQuantity')}:{' '}
              <DecimalDisplay
                value={selectedTotal}
                suffix={lineRow.requestLine.unit ?? '—'}
              />
            </Typography>
          </Stack>
        );

        if (!hasLineOffers) {
          return (
            <Box
              key={lineRow.id}
              sx={{
                px: 2,
                py: 1.5,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              {header}
            </Box>
          );
        }

        return (
          <Accordion
            key={lineRow.id}
            defaultExpanded
            sx={
              lineIsOverOrdered(lineRow)
                ? {
                    bgcolor: (theme) =>
                      alpha(theme.palette.success.main, 0.08),
                  }
                : undefined
            }
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              {header}
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: 'action.hover' }}>
              <Stack spacing={1.5}>
                {lineRow.offers.map((offerRow) => {
                  const isSelected = hasSelectedQuantity(offerRow.offer);
                  return (
                    <Box
                      key={offerRow.id}
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor: isSelected
                          ? (theme) => alpha(theme.palette.success.main, 0.12)
                          : 'transparent',
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2">
                          {offerRow.offer.supplierCompany.name}
                        </Typography>
                        <OfferCardDetails
                          row={offerRow}
                          companyId={companyId}
                          selectionEnabled={selectionEnabled}
                          materialRequestId={materialRequestId}
                          unit={lineRow.requestLine.unit}
                        />
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
}
