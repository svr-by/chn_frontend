import {
  getStoredItem,
  removeStoredItem,
  setStoredItem,
} from '@/lib/browserStorage';

const KEYS = {
  ACCESS_TOKEN: 'chn_access_token',
  REFRESH_TOKEN: 'chn_refresh_token',
  ACTIVE_COMPANY_ID: 'chn_active_company_id',
} as const;

export const authStorage = {
  getAccessToken(): string | null {
    return getStoredItem(KEYS.ACCESS_TOKEN);
  },

  setAccessToken(token: string): void {
    setStoredItem(KEYS.ACCESS_TOKEN, token);
  },

  clearAccessToken(): void {
    removeStoredItem(KEYS.ACCESS_TOKEN);
  },

  getRefreshToken(): string | null {
    return getStoredItem(KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(token: string): void {
    setStoredItem(KEYS.REFRESH_TOKEN, token);
  },

  clearRefreshToken(): void {
    removeStoredItem(KEYS.REFRESH_TOKEN);
  },

  getActiveCompanyId(): string | null {
    return getStoredItem(KEYS.ACTIVE_COMPANY_ID);
  },

  setActiveCompanyId(companyId: string): void {
    setStoredItem(KEYS.ACTIVE_COMPANY_ID, companyId);
  },

  clearActiveCompanyId(): void {
    removeStoredItem(KEYS.ACTIVE_COMPANY_ID);
  },

  clearAll(): void {
    removeStoredItem(KEYS.ACCESS_TOKEN);
    removeStoredItem(KEYS.REFRESH_TOKEN);
    removeStoredItem(KEYS.ACTIVE_COMPANY_ID);
  },
};
