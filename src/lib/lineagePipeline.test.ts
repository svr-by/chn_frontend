import { describe, expect, it } from 'vitest';

import {
  buildLineagePipeline,
  groupPipelineItemsByDocument,
} from '@/lib/lineagePipeline';
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

  it('includes rejectedAt and rejectionReason in quote meta when present', () => {
    const trace = createLineageTrace();
    const quote = trace.quotes[0];
    if (!quote) {
      throw new Error('expected a quote in the fixture');
    }
    quote.line.rejectedAt = '2026-07-15T10:00:00.000Z';
    quote.line.rejectionReason = 'Too expensive';

    const quoteItem = buildLineagePipeline(trace).find(
      (step) => step.stage === 'quotes',
    )?.items[0];

    expect(quoteItem?.meta?.rejectedAt).toBe('2026-07-15T10:00:00.000Z');
    expect(quoteItem?.meta?.rejectionReason).toBe('Too expensive');
  });

  it('includes leadTime in quote meta when present', () => {
    const trace = createLineageTrace();
    const quote = trace.quotes[0];
    if (!quote) {
      throw new Error('expected a quote in the fixture');
    }
    quote.line.leadTime = 2;
    quote.line.leadTimeUnit = 'WEEK';

    const quoteItem = buildLineagePipeline(trace).find(
      (step) => step.stage === 'quotes',
    )?.items[0];

    expect(quoteItem?.meta?.leadTime).toBe('2');
    expect(quoteItem?.meta?.leadTimeUnit).toBe('WEEK');
  });

  it('groups quote cards by documentId and sorts by lineNumber within a document', () => {
    const quoteA = '00000000-0000-0000-0000-0000000000aa';
    const quoteB = '00000000-0000-0000-0000-0000000000bb';
    const company = {
      id: '00000000-0000-0000-0000-000000000030',
      name: 'Supplier Ltd',
    };
    const createdBy = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Jane Doe',
    };

    const trace = createLineageTrace({
      quotes: [
        {
          quoteId: quoteB,
          company,
          status: 'SUBMITTED',
          currency: 'USD',
          number: 'Q-B',
          createdAt: '2026-01-01T00:00:00.000Z',
          createdBy,
          line: {
            id: '00000000-0000-0000-0000-000000000201',
            lineNumber: 1,
            lineageId: '00000000-0000-0000-0000-000000000052',
            quantity: '1',
            unitPrice: '1',
            lineTotal: '1',
            leadTime: null,
            leadTimeUnit: null,
            notes: null,
            rejectedAt: null,
            rejectionReason: null,
            selectionLine: null,
          },
        },
        {
          quoteId: quoteA,
          company,
          status: 'SUBMITTED',
          currency: 'USD',
          number: 'Q-A-2',
          createdAt: '2026-01-01T00:00:00.000Z',
          createdBy,
          line: {
            id: '00000000-0000-0000-0000-000000000202',
            lineNumber: 2,
            lineageId: '00000000-0000-0000-0000-000000000052',
            quantity: '1',
            unitPrice: '1',
            lineTotal: '1',
            leadTime: null,
            leadTimeUnit: null,
            notes: null,
            rejectedAt: null,
            rejectionReason: null,
            selectionLine: null,
          },
        },
        {
          quoteId: quoteA,
          company,
          status: 'SUBMITTED',
          currency: 'USD',
          number: 'Q-A-1',
          createdAt: '2026-01-01T00:00:00.000Z',
          createdBy,
          line: {
            id: '00000000-0000-0000-0000-000000000203',
            lineNumber: 1,
            lineageId: '00000000-0000-0000-0000-000000000052',
            quantity: '1',
            unitPrice: '1',
            lineTotal: '1',
            leadTime: null,
            leadTimeUnit: null,
            notes: null,
            rejectedAt: null,
            rejectionReason: null,
            selectionLine: null,
          },
        },
      ],
    });

    const quoteItems =
      buildLineagePipeline(trace).find((step) => step.stage === 'quotes')
        ?.items ?? [];

    expect(quoteItems.map((item) => item.documentId)).toEqual([
      quoteA,
      quoteA,
      quoteB,
    ]);
    expect(quoteItems.map((item) => item.meta?.lineNumber)).toEqual([
      '1',
      '2',
      '1',
    ]);
  });

  it('groups consecutive same-document items into rows', () => {
    const items = [
      { documentId: 'a', label: 'a1', status: 'X', link: '#' },
      { documentId: 'a', label: 'a2', status: 'X', link: '#' },
      { documentId: 'b', label: 'b1', status: 'X', link: '#' },
    ];

    expect(groupPipelineItemsByDocument(items)).toEqual([
      [items[0], items[1]],
      [items[2]],
    ]);
  });
});
