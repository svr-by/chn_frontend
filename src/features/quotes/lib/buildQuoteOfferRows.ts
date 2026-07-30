import type { QuoteLine } from '@/api/generated/models/quoteLine';
import type { RequestLine } from '@/api/generated/models/requestLine';
import { MAX_QUOTE_LINE_VARIANTS } from '@/features/quotes/lib/quoteLineVariants';

export type QuoteOfferRow = {
  id: string;
  requestLineId: string;
  lineNumber: number;
  description: string;
  requestedQuantity: string;
  unit: string | null;
  cancelledAt: string | null;
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
    quoteLine,
    variantIndex: index + 1,
    variantCount,
    canAddVariant: options.canAddVariant,
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
    const activeRequestLineIds = new Set(requestLines.map((line) => line.id));

    const activeRows = [...requestLines]
      .sort((a, b) => a.lineNumber - b.lineNumber)
      .flatMap((requestLine) => {
        const group = quoteLinesByRequestLineId.get(requestLine.id) ?? [];
        const variantCount = group.length;
        const canAddVariant =
          editable && variantCount < MAX_QUOTE_LINE_VARIANTS;

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
              quoteLine: null,
              variantIndex: 0,
              variantCount: 0,
              canAddVariant,
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
            quoteLine,
            variantIndex: index + 1,
            variantCount,
            canAddVariant,
            isLastInGroup: index === group.length - 1,
          }),
        );
      });

    const cancelledOfferRows = [...quoteLinesByRequestLineId.entries()]
      .filter(([requestLineId]) => !activeRequestLineIds.has(requestLineId))
      .sort(([, groupA], [, groupB]) => {
        const lineNumberA = groupA[0]?.requestLine.lineNumber ?? 0;
        const lineNumberB = groupB[0]?.requestLine.lineNumber ?? 0;
        return lineNumberA - lineNumberB;
      })
      .flatMap(([, group]) =>
        rowsFromQuoteLineGroup(group, { canAddVariant: false }),
      );

    return [...activeRows, ...cancelledOfferRows];
  }

  return [...quoteLinesByRequestLineId.entries()]
    .sort(([, groupA], [, groupB]) => {
      const lineNumberA = groupA[0]?.requestLine.lineNumber ?? 0;
      const lineNumberB = groupB[0]?.requestLine.lineNumber ?? 0;
      return lineNumberA - lineNumberB;
    })
    .flatMap(([, group]) =>
      rowsFromQuoteLineGroup(group, {
        canAddVariant: editable && group.length < MAX_QUOTE_LINE_VARIANTS,
      }),
    );
}
