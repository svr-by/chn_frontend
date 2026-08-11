import { describe, expect, it } from 'vitest';

import {
  billableToDraftLine,
  groupDraftLinesByRequest,
  validateDraftInvoiceLines,
} from '@/features/invoices/lib/draftInvoiceLine';
import { createBillableLine, REQUEST_ID } from '@/test/fixtures';

describe('draftInvoiceLine', () => {
  it('groups lines by requestId', () => {
    const lines = [
      billableToDraftLine({
        billable: createBillableLine(),
        quantity: '1',
        requestId: REQUEST_ID,
        currency: 'USD',
        buyerCompanyId: 'buyer-1',
        quoteId: 'quote-1',
      }),
      billableToDraftLine({
        billable: createBillableLine({
          selectionLineId: '00000000-0000-0000-0000-000000000099',
        }),
        quantity: '2',
        requestId: '00000000-0000-0000-0000-000000000002',
        currency: 'USD',
        buyerCompanyId: 'buyer-1',
        quoteId: 'quote-2',
      }),
    ];

    expect(groupDraftLinesByRequest(lines)).toHaveLength(2);
  });

  it('rejects mixed currency and empty lines', () => {
    expect(validateDraftInvoiceLines([])).toEqual({
      ok: false,
      reason: 'empty',
    });

    const mixed = [
      billableToDraftLine({
        billable: createBillableLine(),
        quantity: '1',
        requestId: REQUEST_ID,
        currency: 'USD',
        buyerCompanyId: 'buyer-1',
        quoteId: 'quote-1',
      }),
      billableToDraftLine({
        billable: createBillableLine({
          selectionLineId: '00000000-0000-0000-0000-000000000099',
        }),
        quantity: '1',
        requestId: REQUEST_ID,
        currency: 'EUR',
        buyerCompanyId: 'buyer-1',
        quoteId: 'quote-1',
      }),
    ];

    expect(validateDraftInvoiceLines(mixed)).toEqual({
      ok: false,
      reason: 'mixedCurrency',
    });
  });
});
