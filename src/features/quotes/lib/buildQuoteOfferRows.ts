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
  quoteLine: QuoteLine | null;
  variantIndex: number;
  variantCount: number;
  canAddVariant: boolean;
  isLastInGroup: boolean;
};

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
    return [...requestLines]
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
            quoteLine,
            variantIndex: index + 1,
            variantCount,
            canAddVariant,
            isLastInGroup: index === group.length - 1,
          }),
        );
      });
  }

  return lines.map((line, index, all) => {
    const group = quoteLinesByRequestLineId.get(line.requestLineId) ?? [line];
    const variantIndex = group.findIndex((item) => item.id === line.id) + 1;
    const variantCount = group.length;
    return {
      id: line.id,
      requestLineId: line.requestLineId,
      lineNumber: line.lineNumber,
      description: line.requestLine.description,
      requestedQuantity: line.requestLine.quantity,
      unit: line.requestLine.unit ?? null,
      quoteLine: line,
      variantIndex,
      variantCount,
      canAddVariant: editable && variantCount < MAX_QUOTE_LINE_VARIANTS,
      isLastInGroup:
        index === all.length - 1 ||
        all[index + 1]?.requestLineId !== line.requestLineId,
    };
  });
}
