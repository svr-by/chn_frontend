import { describe, expect, it } from 'vitest';

import { createBillableLine } from '@/test/fixtures';

import {
  formatInvoiceQuoteLineOptionLabel,
  formatInvoiceQuoteOptionLabel,
  truncateInvoiceQuoteCompanyLabel,
} from '@/features/invoices/lib/invoiceQuoteOptionLabel';

describe('truncateInvoiceQuoteCompanyLabel', () => {
  it('returns value unchanged when within limit', () => {
    expect(truncateInvoiceQuoteCompanyLabel('Buyer Co', 24)).toBe('Buyer Co');
  });

  it('truncates long company names with ellipsis', () => {
    expect(
      truncateInvoiceQuoteCompanyLabel('Very Long Company Name Ltd', 20),
    ).toBe('Very Long Company N…');
  });
});

describe('formatInvoiceQuoteOptionLabel', () => {
  it('includes company, number, date and currency', () => {
    const label = formatInvoiceQuoteOptionLabel({
      id: '00000000-0000-0000-0000-000000000070',
      number: 'Q-001',
      createdAt: '2026-01-15T00:00:00.000Z',
      currency: 'USD',
      buyerCompany: { id: 'buyer-id', name: 'Buyer Co' },
    });

    expect(label).toContain('Buyer Co');
    expect(label).toContain('Q-001');
    expect(label).toContain('USD');
    expect(label).toMatch(/Buyer Co · Q-001 · .+ · USD/);
  });

  it('omits quote number when absent', () => {
    const label = formatInvoiceQuoteOptionLabel({
      id: '00000000-0000-0000-0000-000000000070',
      number: null,
      createdAt: '2026-01-15T00:00:00.000Z',
      currency: 'EUR',
      buyerCompany: { id: 'buyer-id', name: 'Buyer Co' },
    });

    expect(label).toMatch(/Buyer Co · .+ · EUR/);
    expect(label).not.toContain('null');
  });
});

describe('formatInvoiceQuoteLineOptionLabel', () => {
  it('includes quantity breakdown and unit price', () => {
    expect(
      formatInvoiceQuoteLineOptionLabel(createBillableLine(), 'USD'),
    ).toBe(
      'Bolt M8 — remaining 10 (selected 10, invoiced 0) · 10 x 1.00 USD',
    );
  });

  it('falls back when description is missing', () => {
    expect(
      formatInvoiceQuoteLineOptionLabel(
        createBillableLine({ requestLine: null }),
        'USD',
      ),
    ).toBe('— — remaining 10 (selected 10, invoiced 0) · 10 x 1.00 USD');
  });
});
