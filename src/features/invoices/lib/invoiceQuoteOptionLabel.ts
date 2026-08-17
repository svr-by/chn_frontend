import type { BillableLine } from '@/api/generated/models/billableLine';
import type { SupplierQuoteSummary } from '@/api/generated/models/supplierQuoteSummary';

const DEFAULT_COMPANY_LABEL_MAX_LENGTH = 24;

export function truncateInvoiceQuoteCompanyLabel(
  value: string,
  maxLength = DEFAULT_COMPANY_LABEL_MAX_LENGTH,
): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1)}…`;
}

export function formatInvoiceQuoteOptionLabel(
  quote: Pick<
    SupplierQuoteSummary,
    'id' | 'number' | 'createdAt' | 'currency' | 'buyerCompany'
  >,
): string {
  const company = truncateInvoiceQuoteCompanyLabel(
    quote.buyerCompany?.name ?? quote.id.slice(0, 8),
  );
  const date = new Date(quote.createdAt).toLocaleDateString();
  const parts = [company];

  if (quote.number) {
    parts.push(quote.number);
  }

  parts.push(date, quote.currency);
  return parts.join(' · ');
}

export function formatInvoiceQuoteLineOptionLabel(
  line: Pick<BillableLine, 'quantity' | 'unitPrice' | 'lineTotal' | 'requestLine'>,
  currency: string,
): string {
  const description = line.requestLine?.description?.trim() || '—';
  return [description, `${line.quantity} x ${line.unitPrice} ${currency}`].join(
    ' · ',
  );
}
