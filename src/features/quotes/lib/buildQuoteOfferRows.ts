import type { QuoteLine } from '@/api/generated/models/quoteLine';
import type { RequestLine } from '@/api/generated/models/requestLine';
import { MAX_QUOTE_LINE_VARIANTS } from '@/features/quotes/lib/quoteLineVariants';
import { isQuoteLineRejected } from '@/lib/quoteLineRejected';
import { isRequestLineCancelled } from '@/lib/requestLineCancelled';

export type QuoteOfferRow = {
  id: string;
  requestLineId: string;
  lineNumber: number;
  description: string;
  requestedQuantity: string;
  unit: string | null;
  cancelledAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  quoteLine: QuoteLine | null;
  variantIndex: number;
  variantCount: number;
  canAddVariant: boolean;
  isLastInGroup: boolean;
};

function rowsFromQuoteLineGroup(
  group: QuoteLine[],
  options: { canAddVariant: boolean },
): QuoteOfferRow[] {
  const sorted = [...group].sort((a, b) => a.lineNumber - b.lineNumber);
  const variantCount = sorted.length;

  return sorted.map((quoteLine, index): QuoteOfferRow => ({
    id: quoteLine.id,
    requestLineId: quoteLine.requestLineId,
    lineNumber: quoteLine.requestLine.lineNumber,
    description: quoteLine.requestLine.description,
    requestedQuantity: quoteLine.requestLine.quantity,
    unit: quoteLine.requestLine.unit ?? null,
    cancelledAt: quoteLine.requestLine.cancelledAt,
    rejectedAt: quoteLine.rejectedAt,
    rejectionReason: quoteLine.rejectionReason,
    quoteLine,
    variantIndex: index + 1,
    variantCount,
    canAddVariant:
      options.canAddVariant && !isQuoteLineRejected(quoteLine.rejectedAt),
    isLastInGroup: index === sorted.length - 1,
  }));
}

export function buildQuoteOfferRows(
  lines: QuoteLine[],
  requestLines: RequestLine[],
  editable: boolean,
): QuoteOfferRow[] {
  const quoteLinesByRequestLineId = new Map<string, QuoteLine[]>();
  for (const line of lines) {
    const group = quoteLinesByRequestLineId.get(line.requestLineId) ?? [];
    group.push(line);
    quoteLinesByRequestLineId.set(line.requestLineId, group);
  }

  for (const group of quoteLinesByRequestLineId.values()) {
    group.sort((a, b) => a.lineNumber - b.lineNumber);
  }

  if (requestLines.length > 0) {
    const requestLineIds = new Set(requestLines.map((line) => line.id));

    const requestRows = [...requestLines]
      .sort((a, b) => a.lineNumber - b.lineNumber)
      .flatMap((requestLine) => {
        const group = quoteLinesByRequestLineId.get(requestLine.id) ?? [];
        const variantCount = group.length;
        const canAddVariantBase =
          editable &&
          !isRequestLineCancelled(requestLine.cancelledAt) &&
          variantCount < MAX_QUOTE_LINE_VARIANTS;

        if (group.length === 0) {
          return [
            {
              id: `empty-${requestLine.id}`,
              requestLineId: requestLine.id,
              lineNumber: requestLine.lineNumber,
              description: requestLine.description,
              requestedQuantity: requestLine.quantity,
              unit: requestLine.unit ?? null,
              cancelledAt: requestLine.cancelledAt,
              rejectedAt: null,
              rejectionReason: null,
              quoteLine: null,
              variantIndex: 0,
              variantCount: 0,
              canAddVariant: canAddVariantBase,
              isLastInGroup: true,
            } satisfies QuoteOfferRow,
          ];
        }

        return group.map(
          (quoteLine, index): QuoteOfferRow => ({
            id: quoteLine.id,
            requestLineId: requestLine.id,
            lineNumber: requestLine.lineNumber,
            description: requestLine.description,
            requestedQuantity: requestLine.quantity,
            unit: requestLine.unit ?? null,
            cancelledAt: requestLine.cancelledAt,
            rejectedAt: quoteLine.rejectedAt,
            rejectionReason: quoteLine.rejectionReason,
            quoteLine,
            variantIndex: index + 1,
            variantCount,
            canAddVariant:
              canAddVariantBase && !isQuoteLineRejected(quoteLine.rejectedAt),
            isLastInGroup: index === group.length - 1,
          }),
        );
      });

    const orphanOfferRows = [...quoteLinesByRequestLineId.entries()]
      .filter(([requestLineId]) => !requestLineIds.has(requestLineId))
      .sort(([, groupA], [, groupB]) => {
        const lineNumberA = groupA[0]?.requestLine.lineNumber ?? 0;
        const lineNumberB = groupB[0]?.requestLine.lineNumber ?? 0;
        return lineNumberA - lineNumberB;
      })
      .flatMap(([, group]) =>
        rowsFromQuoteLineGroup(group, { canAddVariant: false }),
      );

    return [...requestRows, ...orphanOfferRows];
  }

  return [...quoteLinesByRequestLineId.entries()]
    .sort(([, groupA], [, groupB]) => {
      const lineNumberA = groupA[0]?.requestLine.lineNumber ?? 0;
      const lineNumberB = groupB[0]?.requestLine.lineNumber ?? 0;
      return lineNumberA - lineNumberB;
    })
    .flatMap(([, group]) =>
      rowsFromQuoteLineGroup(group, {
        canAddVariant:
          editable &&
          !isRequestLineCancelled(group[0]?.requestLine.cancelledAt) &&
          group.length < MAX_QUOTE_LINE_VARIANTS,
      }),
    );
}
