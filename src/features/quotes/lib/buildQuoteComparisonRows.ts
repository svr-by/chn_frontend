import type { QuoteComparisonLine } from '@/api/generated/models/quoteComparisonLine';
import type { QuoteComparisonRequestLine } from '@/api/generated/models/quoteComparisonRequestLine';
import type { QuoteOffer } from '@/api/generated/models/quoteOffer';
import { SELECTABLE_QUOTE_STATUSES } from '@/features/quotes/lib/quoteSelection';

export type QuoteComparisonOfferRow = {
  id: string;
  offer: QuoteOffer;
  variantIndex?: number;
  variantCount?: number;
};

export type QuoteComparisonLineRow = {
  id: string;
  requestLine: QuoteComparisonRequestLine;
  offers: QuoteComparisonOfferRow[];
};

export function buildQuoteComparisonRows(
  lines: QuoteComparisonLine[],
): QuoteComparisonLineRow[] {
  return lines.map((line) => {
    const offersBySupplier = new Map<string, QuoteOffer[]>();

    for (const offer of line.offers) {
      const supplierId = offer.supplierCompany.id;
      const group = offersBySupplier.get(supplierId) ?? [];
      group.push(offer);
      offersBySupplier.set(supplierId, group);
    }

    const offers: QuoteComparisonOfferRow[] = [];

    for (const supplierOffers of offersBySupplier.values()) {
      supplierOffers.forEach((offer, index) => {
        offers.push({
          id: `${line.requestLine.id}-${offer.quoteLineId}`,
          offer,
          variantIndex:
            supplierOffers.length > 1 ? index + 1 : undefined,
          variantCount:
            supplierOffers.length > 1 ? supplierOffers.length : undefined,
        });
      });
    }

    return {
      id: line.requestLine.id,
      requestLine: line.requestLine,
      offers,
    };
  });
}

export function comparisonHasOffers(lines: QuoteComparisonLine[]): boolean {
  return lines.some((line) => line.offers.length > 0);
}

export function comparisonHasSelectableOffers(
  lines: QuoteComparisonLine[],
): boolean {
  return lines.some((line) =>
    line.offers.some((offer) => SELECTABLE_QUOTE_STATUSES.has(offer.status)),
  );
}
