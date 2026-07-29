import { describe, expect, it } from 'vitest';

import {
  parseDocumentDetailTab,
  resolveDocumentPath,
} from '@/lib/documentRoutes';
import { INVOICE_ID, REQUEST_ID } from '@/test/fixtures';

describe('resolveDocumentPath', () => {
  it('maps all document types to detail routes', () => {
    expect(resolveDocumentPath('MATERIAL_REQUEST', REQUEST_ID)).toBe(
      `/app/requests/${REQUEST_ID}`,
    );
    expect(resolveDocumentPath('SUPPLIER_QUOTE', 'q1')).toBe('/app/quotes/q1');
    expect(resolveDocumentPath('INVOICE', INVOICE_ID)).toBe(
      `/app/invoices/${INVOICE_ID}`,
    );
    expect(resolveDocumentPath('PAYMENT', 'p1')).toBe('/app/payments/p1');
    expect(resolveDocumentPath('SHIPPING_INVOICE', 'sh1')).toBe(
      '/app/shipping-invoices/sh1',
    );
    expect(resolveDocumentPath('CONSOLIDATION', 'c1')).toBe(
      '/app/consolidations/c1',
    );
  });

  it('appends tab query when requested', () => {
    expect(
      resolveDocumentPath('INVOICE', INVOICE_ID, { tab: 'comments' }),
    ).toBe(`/app/invoices/${INVOICE_ID}?tab=comments`);
    expect(resolveDocumentPath('INVOICE', INVOICE_ID, { tab: 'trace' })).toBe(
      `/app/invoices/${INVOICE_ID}?tab=trace`,
    );
    expect(resolveDocumentPath('INVOICE', INVOICE_ID, { tab: 'related' })).toBe(
      `/app/invoices/${INVOICE_ID}?tab=related`,
    );
  });

  it('returns null when document id or type is missing', () => {
    expect(resolveDocumentPath(null, INVOICE_ID)).toBeNull();
    expect(resolveDocumentPath('INVOICE', null)).toBeNull();
  });
});

describe('parseDocumentDetailTab', () => {
  it('parses supported tab values', () => {
    expect(parseDocumentDetailTab('comments')).toBe('comments');
    expect(parseDocumentDetailTab('activity')).toBe('activity');
    expect(parseDocumentDetailTab('trace')).toBe('trace');
    expect(parseDocumentDetailTab('related')).toBe('related');
    expect(parseDocumentDetailTab('details')).toBeNull();
    expect(parseDocumentDetailTab(null)).toBeNull();
  });
});
