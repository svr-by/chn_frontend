import type {
  QuoteComparisonLineRow,
  QuoteComparisonOfferRow,
} from '@/features/quotes/lib/buildQuoteComparisonRows';
import { isDecimalGte, parseDecimal } from '@/lib/decimal';

export function resolveSelectedQuantity(
  offer: QuoteComparisonOfferRow['offer'],
): string | null {
  return offer.selectedQuantity ?? null;
}

export function hasSelectedQuantity(
  offer: QuoteComparisonOfferRow['offer'],
): boolean {
  return resolveSelectedQuantity(offer) != null;
}

export function sumLineSelectedQuantity(
  line: QuoteComparisonLineRow,
): string | null {
  let hasSelection = false;
  let total = parseDecimal('0');

  for (const offerRow of line.offers) {
    const selected = resolveSelectedQuantity(offerRow.offer);
    if (selected == null) {
      continue;
    }
    hasSelection = true;
    total = total.plus(parseDecimal(selected));
  }

  return hasSelection ? total.toString() : null;
}

export function lineIsOverOrdered(line: QuoteComparisonLineRow): boolean {
  const selectedTotal = sumLineSelectedQuantity(line);
  if (selectedTotal == null) {
    return false;
  }
  return isDecimalGte(selectedTotal, line.requestLine.quantity);
}

export function formatQuoteDate(value: string): string {
  return new Date(value).toLocaleDateString();
}
