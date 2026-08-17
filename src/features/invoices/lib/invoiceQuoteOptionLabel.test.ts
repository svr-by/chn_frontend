import { describe, expect, it } from 'vitest';

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
  it('joins description, quantity, price and total', () => {
    expect(
      formatInvoiceQuoteLineOptionLabel({
        quantity: '10',
        unitPrice: '1.50',
        lineTotal: '15.00',
        requestLine: {
          id: '00000000-0000-0000-0000-000000000051',
          description: 'Bolt M8',
          quantity: '100',
          unit: 'pcs',
          cancelledAt: null,
        },
      }),
    ).toBe('Bolt M8 · 10 @ 1.50 · 15.00');
  });

  it('falls back when description is missing', () => {
    expect(
      formatInvoiceQuoteLineOptionLabel({
        quantity: '2',
        unitPrice: '3.00',
        lineTotal: '6.00',
        requestLine: null,
      }),
    ).toBe('— · 2 @ 3.00 · 6.00');
  });
});
