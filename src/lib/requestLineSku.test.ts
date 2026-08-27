import { describe, expect, it } from 'vitest';

import {
  getRequestLineDisplaySku,
  getRequestLineImportSku,
} from '@/lib/requestLineSku';

describe('getRequestLineImportSku', () => {
  it('returns import sku from attributes', () => {
    expect(
      getRequestLineImportSku({
        description: 'Paper',
        attributes: { importSku: 'PAPER-A4' },
      }),
    ).toBe('PAPER-A4');
  });

  it('returns null when import sku is missing or blank', () => {
    expect(getRequestLineImportSku({ description: 'Paper' })).toBeNull();
    expect(
      getRequestLineImportSku({
        description: 'Paper',
        attributes: { importSku: '   ' },
      }),
    ).toBeNull();
  });
});

describe('getRequestLineDisplaySku', () => {
  it('prefers product sku over import sku', () => {
    expect(
      getRequestLineDisplaySku({
        description: 'Paper',
        attributes: { importSku: 'IMP-1' },
        product: { sku: 'SKU-001' },
      }),
    ).toBe('SKU-001');
  });

  it('falls back to import sku when product sku is missing', () => {
    expect(
      getRequestLineDisplaySku({
        description: 'Paper',
        attributes: { importSku: 'PAPER-A4' },
        product: { sku: null },
      }),
    ).toBe('PAPER-A4');
  });

  it('falls back to top-level draft sku when product and import sku are missing', () => {
    expect(
      getRequestLineDisplaySku({
        description: 'Paper',
        sku: 'DRAFT-1',
      }),
    ).toBe('DRAFT-1');
  });
});
