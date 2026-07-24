import { describe, expect, it } from 'vitest';

import {
  buildRelatedGraphView,
  getRelationshipNodeLabel,
} from '@/lib/documentRelationships';
import {
  createDocumentRelationships,
  INVOICE_ID,
  REQUEST_ID,
} from '@/test/fixtures';

const QUOTE_ID = '11111111-1111-4111-8111-111111111111';
const PAYMENT_ID = '22222222-2222-4222-8222-222222222222';

describe('documentRelationships', () => {
  it('groups nodes into stages and keeps current first in its stage', () => {
    const graph = createDocumentRelationships({
      nodes: [
        {
          id: REQUEST_ID,
          documentType: 'MATERIAL_REQUEST',
          status: 'QUOTING',
          label: 'Office supplies',
          companyName: 'Buyer Corp',
        },
        {
          id: QUOTE_ID,
          documentType: 'SUPPLIER_QUOTE',
          status: 'SUBMITTED',
          label: 'Q-12',
          companyName: 'Supplier Corp',
        },
        {
          id: INVOICE_ID,
          documentType: 'INVOICE',
          status: 'ISSUED',
          label: 'INV-001',
          companyName: 'Supplier Corp',
        },
        {
          id: PAYMENT_ID,
          documentType: 'PAYMENT',
          status: 'CONFIRMED',
          label: 'PAY-001',
          companyName: 'Buyer Corp',
        },
      ],
    });

    const view = buildRelatedGraphView(graph, INVOICE_ID);

    expect(view.stages.map((stage) => stage.documentType)).toEqual([
      'MATERIAL_REQUEST',
      'SUPPLIER_QUOTE',
      'INVOICE',
      'PAYMENT',
    ]);
    expect(view.stages[2]?.nodes[0]?.id).toBe(INVOICE_ID);
  });

  it('never uses uuid labels when resolving display text', () => {
    expect(
      getRelationshipNodeLabel(
        {
          id: REQUEST_ID,
          documentType: 'MATERIAL_REQUEST',
          status: 'DRAFT',
          label: REQUEST_ID,
          companyName: 'Buyer Corp',
        },
        'Request',
      ),
    ).toBe('Buyer Corp');

    expect(
      getRelationshipNodeLabel(
        {
          id: REQUEST_ID,
          documentType: 'MATERIAL_REQUEST',
          status: 'DRAFT',
          label: REQUEST_ID,
          companyName: null,
        },
        'Request',
      ),
    ).toBe('Request');
  });
});
