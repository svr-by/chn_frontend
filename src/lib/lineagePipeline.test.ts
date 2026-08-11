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
      'selections',
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
          supplierCompany: {
            id: '00000000-0000-0000-0000-000000000030',
            name: 'Supplier Ltd',
          },
          status: 'ISSUED',
          currency: 'USD',
          number: 'INV-001',
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
  });
});
