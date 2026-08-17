import { describe, expect, it } from 'vitest';

import {
  applyTranslatedPreviewToDraftLines,
  draftLinesToCreatePayload,
  draftLinesToTranslatePreview,
  isCsvImportFile,
  mapPreviewRowsToDraftLines,
  type DraftRequestLine,
} from '@/features/requests/lib/draftRequestLine';

describe('draftRequestLine helpers', () => {
  it('detects CSV files by extension and mime type', () => {
    expect(
      isCsvImportFile(new File(['a'], 'lines.csv', { type: 'text/csv' })),
    ).toBe(true);
    expect(
      isCsvImportFile(new File(['a'], 'lines.HTM', { type: 'text/html' })),
    ).toBe(false);
    expect(
      isCsvImportFile(new File(['a'], 'export', { type: 'text/csv' })),
    ).toBe(true);
  });

  it('maps valid preview rows to draft lines and skips invalid ones', () => {
    const lines = mapPreviewRowsToDraftLines([
      {
        rowNumber: 1,
        data: {},
        errors: [],
        parsed: {
          description: 'Bolt',
          quantity: '10',
          unit: 'pcs',
          sku: 'B-1',
          productId: null,
          notes: 'M8',
        },
      },
      {
        rowNumber: 2,
        data: {},
        errors: ['missing quantity'],
        parsed: {
          description: 'Broken',
          quantity: '1',
          unit: null,
          sku: null,
          productId: null,
          notes: null,
        },
      },
      {
        rowNumber: 3,
        data: {},
        errors: [],
      },
    ]);

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      description: 'Bolt',
      quantity: '10',
      unit: 'pcs',
      sku: 'B-1',
      notes: 'M8',
    });
    expect(lines[0]?.clientId).toBeTruthy();
  });

  it('maps draft lines to create payload without empty optionals', () => {
    const draft: DraftRequestLine[] = [
      {
        clientId: '1',
        description: 'Widget',
        quantity: '2.5',
        unit: 'kg',
        notes: '',
      },
      {
        clientId: '2',
        description: 'Gadget',
        quantity: '1',
        productId: '11111111-1111-1111-8111-111111111111',
        sku: 'G-1',
        notes: 'rush',
      },
    ];

    expect(draftLinesToCreatePayload(draft)).toEqual([
      {
        description: 'Widget',
        quantity: '2.5',
        unit: 'kg',
      },
      {
        description: 'Gadget',
        quantity: '1',
        productId: '11111111-1111-1111-8111-111111111111',
        sku: 'G-1',
        notes: 'rush',
      },
    ]);
  });

  it('maps draft lines to a translate preview and applies translated texts', () => {
    const lines: DraftRequestLine[] = [
      {
        clientId: 'c1',
        description: 'Bolt',
        quantity: '10',
        unit: 'pcs',
        sku: 'B-1',
        notes: 'M8',
      },
    ];

    const preview = draftLinesToTranslatePreview(lines);
    expect(preview.validRowCount).toBe(1);
    expect(preview.rows[0]?.parsed?.description).toBe('Bolt');
    expect(preview.rows[0]?.parsed?.quantity).toBe('10');

    const translated = applyTranslatedPreviewToDraftLines(lines, {
      validRowCount: 1,
      invalidRowCount: 0,
      rows: [
        {
          rowNumber: 1,
          data: {},
          errors: [],
          parsed: {
            description: 'Болт',
            quantity: '99',
            unit: 'шт',
            sku: 'CHANGED',
            productId: null,
            notes: 'М8',
          },
        },
      ],
    });

    expect(translated).toEqual([
      {
        clientId: 'c1',
        description: 'Болт',
        quantity: '10',
        unit: 'шт',
        sku: 'B-1',
        notes: 'М8',
      },
    ]);
  });
});
