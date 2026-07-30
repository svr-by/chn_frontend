import { describe, expect, it, beforeEach, vi } from 'vitest';

import {
  getStoredItem,
  removeStoredItem,
  setStoredItem,
} from '@/lib/browserStorage';

describe('browserStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('reads, writes, and removes values', () => {
    expect(getStoredItem('chn_test')).toBeNull();

    setStoredItem('chn_test', 'value');
    expect(getStoredItem('chn_test')).toBe('value');

    removeStoredItem('chn_test');
    expect(getStoredItem('chn_test')).toBeNull();
  });

  it('returns null when getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });

    expect(getStoredItem('chn_test')).toBeNull();
  });

  it('swallows setItem and removeItem failures', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('denied');
    });

    expect(() => setStoredItem('chn_test', 'value')).not.toThrow();
    expect(() => removeStoredItem('chn_test')).not.toThrow();
  });
});
