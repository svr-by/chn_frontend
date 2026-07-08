const KEYS = {
  ACCESS_TOKEN: 'chn_access_token',
  REFRESH_TOKEN: 'chn_refresh_token',
  ACTIVE_COMPANY_ID: 'chn_active_company_id',
} as const;

function getItem(key: string): string | null {
  return localStorage.getItem(key);
}

function setItem(key: string, value: string): void {
  localStorage.setItem(key, value);
}

function removeItem(key: string): void {
  localStorage.removeItem(key);
}

export const authStorage = {
  getAccessToken(): string | null {
    return getItem(KEYS.ACCESS_TOKEN);
  },

  setAccessToken(token: string): void {
    setItem(KEYS.ACCESS_TOKEN, token);
  },

  clearAccessToken(): void {
    removeItem(KEYS.ACCESS_TOKEN);
  },

  getRefreshToken(): string | null {
    return getItem(KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(token: string): void {
    setItem(KEYS.REFRESH_TOKEN, token);
  },

  clearRefreshToken(): void {
    removeItem(KEYS.REFRESH_TOKEN);
  },

  getActiveCompanyId(): string | null {
    return getItem(KEYS.ACTIVE_COMPANY_ID);
  },

  setActiveCompanyId(companyId: string): void {
    setItem(KEYS.ACTIVE_COMPANY_ID, companyId);
  },

  clearActiveCompanyId(): void {
    removeItem(KEYS.ACTIVE_COMPANY_ID);
  },

  clearAll(): void {
    removeItem(KEYS.ACCESS_TOKEN);
    removeItem(KEYS.REFRESH_TOKEN);
    removeItem(KEYS.ACTIVE_COMPANY_ID);
  },
};
