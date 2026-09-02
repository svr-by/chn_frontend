import { describe, expect, it } from 'vitest';

import { buildLineagePipeline } from '@/lib/lineagePipeline';
import {
  createLineageTrace,
  INVOICE_ID,
  QUOTE_ID,
  REQUEST_ID,
} from '@/test/fixtures';

describe('buildLineagePipeline', () => {
  it('orders stages from request through consolidations', () => {
    const steps = buildLineagePipeline(createLineageTrace());
    expect(steps.map((step) => step.stage)).toEqual([
      'request',
      'quotes',
      'invoices',
      'shipments',
      'consolidations',
    ]);
  });

  it('builds document links for populated stages', () => {
    const steps = buildLineagePipeline(createLineageTrace());
    const requestStep = steps.find((step) => step.stage === 'request');
    const quotesStep = steps.find((step) => step.stage === 'quotes');

    expect(requestStep?.items[0]?.link).toBe(`/app/requests/${REQUEST_ID}`);
    expect(quotesStep?.items[0]?.link).toBe(`/app/quotes/${QUOTE_ID}`);
  });

  it('returns empty items for unreached stages', () => {
    const steps = buildLineagePipeline(createLineageTrace());
    const invoicesStep = steps.find((step) => step.stage === 'invoices');
    expect(invoicesStep?.items).toEqual([]);
  });

  it('maps multiple invoices', () => {
    const trace = createLineageTrace({
      invoices: [
        {
          invoiceId: INVOICE_ID,
          company: {
            id: '00000000-0000-0000-0000-000000000030',
            name: 'Supplier Ltd',
          },
          status: 'ISSUED',
          currency: 'USD',
          number: 'INV-001',
          createdAt: '2026-01-02T00:00:00.000Z',
          createdBy: { id: '00000000-0000-0000-0000-000000000001', name: 'Jane Doe' },
          line: {
            id: '00000000-0000-0000-0000-000000000111',
            lineNumber: 1,
            lineageId: '00000000-0000-0000-0000-000000000052',
            quantity: '10.0000',
            unitPrice: '5.0000',
            lineTotal: '50.0000',
            notes: null,
          },
          payments: [],
        },
      ],
    });

    const invoicesStep = buildLineagePipeline(trace).find(
      (step) => step.stage === 'invoices',
    );
    expect(invoicesStep?.items).toHaveLength(1);
    expect(invoicesStep?.items[0]?.link).toBe(`/app/invoices/${INVOICE_ID}`);
    expect(invoicesStep?.items[0]?.meta?.lineNumber).toBe('1');
    expect(invoicesStep?.items[0]?.meta?.companyName).toBe('Supplier Ltd');
  });

  it('includes line numbers for stages that expose them', () => {
    const steps = buildLineagePipeline(createLineageTrace());
    expect(steps.find((s) => s.stage === 'request')?.items[0]?.meta?.lineNumber).toBe(
      '1',
    );
    expect(steps.find((s) => s.stage === 'quotes')?.items[0]?.meta?.lineNumber).toBe(
      '1',
    );
  });

  it('includes company, createdAt, and createdBy from the API', () => {
    const steps = buildLineagePipeline(createLineageTrace());
    const requestItem = steps.find((s) => s.stage === 'request')?.items[0];
    const quoteItem = steps.find((s) => s.stage === 'quotes')?.items[0];

    expect(requestItem?.meta?.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(requestItem?.meta?.companyName).toBe('Acme Corp');
    expect(requestItem?.meta?.createdBy).toBe('Jane Doe');
    expect(quoteItem?.meta?.companyName).toBe('Supplier Ltd');
    expect(quoteItem?.meta?.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(quoteItem?.meta?.createdBy).toBe('Jane Doe');
  });

  it('uses quote number as the label when present', () => {
    const trace = createLineageTrace();
    const quote = trace.quotes[0];
    if (!quote) {
      throw new Error('expected a quote in the fixture');
    }
    quote.number = 'Q-001';

    const quoteItem = buildLineagePipeline(trace).find(
      (step) => step.stage === 'quotes',
    )?.items[0];
    expect(quoteItem?.label).toBe('Q-001');
  });

  it('attaches nested quote.line.selectionLine to the quote item', () => {
    const trace = createLineageTrace();
    const quote = trace.quotes[0];
    if (!quote) {
      throw new Error('expected a quote in the fixture');
    }
    quote.line.selectionLine = {
      id: '00000000-0000-0000-0000-000000000080',
      quantity: '8.0000',
      notes: 'Selected',
      buyerCompanyId: '00000000-0000-0000-0000-000000000010',
      createdAt: '2026-01-03T00:00:00.000Z',
      createdBy: { id: '00000000-0000-0000-0000-000000000001', name: 'Jane Doe' },
    };

    const quoteItem = buildLineagePipeline(trace).find(
      (step) => step.stage === 'quotes',
    )?.items[0];
    expect(quoteItem?.selection).toEqual({
      id: '00000000-0000-0000-0000-000000000080',
      quantity: '8.0000',
      notes: 'Selected',
      createdAt: '2026-01-03T00:00:00.000Z',
      createdBy: 'Jane Doe',
    });
    expect(quoteItem?.link).toBe(`/app/quotes/${QUOTE_ID}`);
  });

  it('includes line notes in quote and invoice meta when present', () => {
    const trace = createLineageTrace({
      invoices: [
        {
          invoiceId: INVOICE_ID,
          company: {
            id: '00000000-0000-0000-0000-000000000030',
            name: 'Supplier Ltd',
          },
          status: 'ISSUED',
          currency: 'USD',
          number: 'INV-001',
          createdAt: '2026-01-02T00:00:00.000Z',
          createdBy: {
            id: '00000000-0000-0000-0000-000000000001',
            name: 'Jane Doe',
          },
          line: {
            id: '00000000-0000-0000-0000-000000000111',
            lineNumber: 1,
            lineageId: '00000000-0000-0000-0000-000000000052',
            quantity: '10.0000',
            unitPrice: '5.0000',
            lineTotal: '50.0000',
            notes: 'Net 30',
          },
          payments: [],
        },
      ],
    });
    const quote = trace.quotes[0];
    if (!quote) {
      throw new Error('expected a quote in the fixture');
    }
    quote.line.notes = '  Rush order  ';

    const quoteItem = buildLineagePipeline(trace).find(
      (step) => step.stage === 'quotes',
    )?.items[0];
    const invoiceItem = buildLineagePipeline(trace).find(
      (step) => step.stage === 'invoices',
    )?.items[0];

    expect(quoteItem?.meta?.notes).toBe('Rush order');
    expect(invoiceItem?.meta?.notes).toBe('Net 30');
  });
});
