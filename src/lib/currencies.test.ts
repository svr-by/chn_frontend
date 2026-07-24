import { describe, expect, it } from 'vitest';

import {
  SUPPORTED_CURRENCIES,
  currencySelectOptions,
  isSupportedCurrency,
} from './currencies';

describe('currencies', () => {
  it('lists the shared currency codes', () => {
    expect(SUPPORTED_CURRENCIES).toEqual(['USD', 'EUR', 'RMB', 'RUB', 'BYN']);
  });

  it('detects supported currencies', () => {
    expect(isSupportedCurrency('USD')).toBe(true);
    expect(isSupportedCurrency('GBP')).toBe(false);
  });

  it('keeps an unexpected current currency in select options', () => {
    expect(currencySelectOptions('GBP')).toEqual([
      'GBP',
      'USD',
      'EUR',
      'RMB',
      'RUB',
      'BYN',
    ]);
    expect(currencySelectOptions('USD')).toEqual([...SUPPORTED_CURRENCIES]);
  });
});
