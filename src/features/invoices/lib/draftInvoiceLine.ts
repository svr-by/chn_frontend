import type { BillableLine } from '@/api/generated/models/billableLine';

export type DraftInvoiceLine = {
  selectionLineId: string;
  quantity: string;
  requestId: string;
  description: string;
  unit: string | null;
  cancelledAt: string | null;
  notes: string | null;
  unitPrice: string;
  lineTotal: string;
  maxQuantity: string;
  currency: string;
  buyerCompanyId: string | null;
  quoteId: string;
};

export function billableToDraftLine(args: {
  billable: BillableLine;
  quantity: string;
  requestId: string;
  currency: string;
  buyerCompanyId: string | null;
  quoteId: string;
}): DraftInvoiceLine {
  return {
    selectionLineId: args.billable.selectionLineId,
    quantity: args.quantity,
    requestId: args.requestId,
    description: args.billable.requestLine?.description ?? '—',
    unit: args.billable.requestLine?.unit ?? null,
    cancelledAt: args.billable.requestLine?.cancelledAt ?? null,
    notes: null,
    unitPrice: args.billable.unitPrice,
    lineTotal: args.billable.lineTotal,
    maxQuantity: args.billable.quantity,
    currency: args.currency,
    buyerCompanyId: args.buyerCompanyId,
    quoteId: args.quoteId,
  };
}

export function groupDraftLinesByRequest(
  lines: DraftInvoiceLine[],
): Array<[string, DraftInvoiceLine[]]> {
  const groups = new Map<string, DraftInvoiceLine[]>();
  for (const line of lines) {
    const existing = groups.get(line.requestId) ?? [];
    existing.push(line);
    groups.set(line.requestId, existing);
  }
  return [...groups.entries()];
}

export function validateDraftInvoiceLines(lines: DraftInvoiceLine[]): {
  ok: boolean;
  reason?: 'empty' | 'mixedBuyer' | 'mixedCurrency' | 'duplicate' | 'badQty';
} {
  if (lines.length === 0) {
    return { ok: false, reason: 'empty' };
  }

  const buyers = new Set(
    lines.map((line) => line.buyerCompanyId).filter(Boolean),
  );
  if (buyers.size > 1) {
    return { ok: false, reason: 'mixedBuyer' };
  }

  const currencies = new Set(lines.map((line) => line.currency));
  if (currencies.size > 1) {
    return { ok: false, reason: 'mixedCurrency' };
  }

  const selectionIds = lines.map((line) => line.selectionLineId);
  if (new Set(selectionIds).size !== selectionIds.length) {
    return { ok: false, reason: 'duplicate' };
  }

  for (const line of lines) {
    const qty = Number(line.quantity);
    const max = Number(line.maxQuantity);
    if (!(qty > 0) || qty > max) {
      return { ok: false, reason: 'badQty' };
    }
  }

  return { ok: true };
}
