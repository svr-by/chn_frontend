import { describe, expect, it } from 'vitest';

import { buildQuoteOfferRows } from '@/features/quotes/lib/buildQuoteOfferRows';
import {
  createQuoteLine,
  createRequestLine,
  REQUEST_LINE_ID,
} from '@/test/fixtures';

const CANCELLED_REQUEST_LINE_ID = '00000000-0000-0000-0000-000000000099';

describe('buildQuoteOfferRows', () => {
  it('keeps quote offers for soft-cancelled request lines omitted from request.lines', () => {
    const activeLine = createRequestLine();
    const cancelledOffer = createQuoteLine({
      id: '00000000-0000-0000-0000-000000000088',
      requestLineId: CANCELLED_REQUEST_LINE_ID,
      requestLine: {
        id: CANCELLED_REQUEST_LINE_ID,
        lineNumber: 2,
        description: 'Cancelled bolt',
        quantity: '5',
        unit: 'pcs',
        cancelledAt: '2026-07-15T10:00:00.000Z',
      },
    });
    const activeOffer = createQuoteLine();

    const rows = buildQuoteOfferRows(
      [activeOffer, cancelledOffer],
      [activeLine],
      true,
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]?.requestLineId).toBe(REQUEST_LINE_ID);
    expect(rows[0]?.cancelledAt).toBeNull();
    expect(rows[0]?.canAddVariant).toBe(true);

    expect(rows[1]?.requestLineId).toBe(CANCELLED_REQUEST_LINE_ID);
    expect(rows[1]?.description).toBe('Cancelled bolt');
    expect(rows[1]?.cancelledAt).toBe('2026-07-15T10:00:00.000Z');
    expect(rows[1]?.canAddVariant).toBe(false);
    expect(rows[1]?.quoteLine?.id).toBe(cancelledOffer.id);
  });

  it('propagates cancelledAt from nested requestLine when requestLines is empty', () => {
    const cancelledOffer = createQuoteLine({
      requestLine: {
        id: REQUEST_LINE_ID,
        lineNumber: 1,
        description: 'Test line',
        quantity: '10',
        unit: 'pcs',
        cancelledAt: '2026-07-20T12:00:00.000Z',
      },
    });

    const rows = buildQuoteOfferRows([cancelledOffer], [], false);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.cancelledAt).toBe('2026-07-20T12:00:00.000Z');
  });

  it('sorts buyer rows by request line number regardless of API order', () => {
    const lineTwo = createQuoteLine({
      id: '00000000-0000-0000-0000-000000000002',
      requestLineId: '00000000-0000-0000-0000-000000000012',
      lineNumber: 1,
      requestLine: {
        id: '00000000-0000-0000-0000-000000000012',
        lineNumber: 2,
        description: 'Second',
        quantity: '2',
        unit: 'pcs',
        cancelledAt: null,
      },
    });
    const lineOne = createQuoteLine({
      id: '00000000-0000-0000-0000-000000000001',
      requestLineId: '00000000-0000-0000-0000-000000000011',
      lineNumber: 1,
      requestLine: {
        id: '00000000-0000-0000-0000-000000000011',
        lineNumber: 1,
        description: 'First',
        quantity: '1',
        unit: 'pcs',
        cancelledAt: null,
      },
    });

    const rows = buildQuoteOfferRows([lineTwo, lineOne], [], false);

    expect(rows.map((row) => row.lineNumber)).toEqual([1, 2]);
    expect(rows.map((row) => row.description)).toEqual(['First', 'Second']);
  });
});
