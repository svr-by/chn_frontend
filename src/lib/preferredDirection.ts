import { getStoredItem, setStoredItem } from '@/lib/browserStorage';

export const PREFERRED_TRADING_ROLE_STORAGE_KEY = 'chn_preferred_trading_role';

export const LIST_DIRECTIONS = ['inbound', 'outbound'] as const;
export const TRADING_ROLES = ['buyer', 'supplier'] as const;
export const LIST_DIRECTION_FAMILIES = ['documents', 'requests'] as const;

export type ListDirection = (typeof LIST_DIRECTIONS)[number];
export type TradingRole = (typeof TRADING_ROLES)[number];
/** documents = quotes/invoices/shipping; requests = requests/request lines */
export type ListDirectionFamily = (typeof LIST_DIRECTION_FAMILIES)[number];

export function isListDirection(
  value: string | null | undefined,
): value is ListDirection {
  return value === 'inbound' || value === 'outbound';
}

export function isTradingRole(
  value: string | null | undefined,
): value is TradingRole {
  return value === 'buyer' || value === 'supplier';
}

/**
 * Requests: buyer sends outbound, supplier receives inbound.
 * Documents (quotes/invoices/shipping): buyer receives inbound, supplier sends outbound.
 */
export function directionForTradingRole(
  role: TradingRole,
  family: ListDirectionFamily,
): ListDirection {
  if (family === 'requests') {
    return role === 'buyer' ? 'outbound' : 'inbound';
  }
  return role === 'buyer' ? 'inbound' : 'outbound';
}

export function tradingRoleForDirection(
  direction: ListDirection,
  family: ListDirectionFamily,
): TradingRole {
  if (family === 'requests') {
    return direction === 'outbound' ? 'buyer' : 'supplier';
  }
  return direction === 'inbound' ? 'buyer' : 'supplier';
}

export function readPreferredTradingRole(): TradingRole | null {
  const stored = getStoredItem(PREFERRED_TRADING_ROLE_STORAGE_KEY);
  return isTradingRole(stored) ? stored : null;
}

export function writePreferredTradingRole(role: TradingRole): void {
  setStoredItem(PREFERRED_TRADING_ROLE_STORAGE_KEY, role);
}
