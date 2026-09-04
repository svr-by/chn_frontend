import { describe, expect, it } from 'vitest';

import { isRequestLineFullyOrdered } from '@/features/requests/lib/requestLineFullyOrdered';

describe('isRequestLineFullyOrdered', () => {
  it('returns true when selected quantity covers requested', () => {
    expect(
      isRequestLineFullyOrdered({ quantity: '10', selectedQuantity: '10' }),
    ).toBe(true);
    expect(
      isRequestLineFullyOrdered({ quantity: '10', selectedQuantity: '12' }),
    ).toBe(true);
  });

  it('returns false when nothing selected or only partially ordered', () => {
    expect(
      isRequestLineFullyOrdered({ quantity: '10', selectedQuantity: null }),
    ).toBe(false);
    expect(
      isRequestLineFullyOrdered({ quantity: '10', selectedQuantity: undefined }),
    ).toBe(false);
    expect(
      isRequestLineFullyOrdered({ quantity: '10', selectedQuantity: '' }),
    ).toBe(false);
    expect(
      isRequestLineFullyOrdered({ quantity: '10', selectedQuantity: '0' }),
    ).toBe(false);
    expect(
      isRequestLineFullyOrdered({ quantity: '10', selectedQuantity: '9.99' }),
    ).toBe(false);
  });
});
