import { describe, expect, it, beforeEach } from 'vitest';

import {
  PREFERRED_TRADING_ROLE_STORAGE_KEY,
  directionForTradingRole,
  isListDirection,
  isTradingRole,
  readPreferredTradingRole,
  tradingRoleForDirection,
  writePreferredTradingRole,
} from '@/lib/preferredDirection';

describe('preferredDirection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('isListDirection accepts only inbound and outbound', () => {
    expect(isListDirection('inbound')).toBe(true);
    expect(isListDirection('outbound')).toBe(true);
    expect(isListDirection('buyer')).toBe(false);
    expect(isListDirection(null)).toBe(false);
  });

  it('isTradingRole accepts only buyer and supplier', () => {
    expect(isTradingRole('buyer')).toBe(true);
    expect(isTradingRole('supplier')).toBe(true);
    expect(isTradingRole('outbound')).toBe(false);
    expect(isTradingRole(null)).toBe(false);
  });

  it('maps buyer/supplier to opposite directions for requests vs documents', () => {
    expect(directionForTradingRole('buyer', 'requests')).toBe('outbound');
    expect(directionForTradingRole('buyer', 'documents')).toBe('inbound');
    expect(directionForTradingRole('supplier', 'requests')).toBe('inbound');
    expect(directionForTradingRole('supplier', 'documents')).toBe('outbound');
  });

  it('maps directions back to trading roles per family', () => {
    expect(tradingRoleForDirection('outbound', 'requests')).toBe('buyer');
    expect(tradingRoleForDirection('inbound', 'documents')).toBe('buyer');
    expect(tradingRoleForDirection('inbound', 'requests')).toBe('supplier');
    expect(tradingRoleForDirection('outbound', 'documents')).toBe('supplier');
  });

  it('returns null when nothing is stored', () => {
    expect(readPreferredTradingRole()).toBeNull();
  });

  it('returns null for invalid stored values', () => {
    localStorage.setItem(PREFERRED_TRADING_ROLE_STORAGE_KEY, 'outbound');
    expect(readPreferredTradingRole()).toBeNull();
  });

  it('reads back a written preferred trading role', () => {
    writePreferredTradingRole('buyer');
    expect(localStorage.getItem(PREFERRED_TRADING_ROLE_STORAGE_KEY)).toBe(
      'buyer',
    );
    expect(readPreferredTradingRole()).toBe('buyer');

    writePreferredTradingRole('supplier');
    expect(readPreferredTradingRole()).toBe('supplier');
  });
});
