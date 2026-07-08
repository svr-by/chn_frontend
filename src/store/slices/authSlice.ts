import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { authStorage } from '@/lib/authStorage';

export interface AuthState {
  activeCompanyId: string | null;
  isBootstrapped: boolean;
}

const initialState: AuthState = {
  activeCompanyId: authStorage.getActiveCompanyId(),
  isBootstrapped: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setActiveCompanyId(state, action: PayloadAction<string | null>) {
      state.activeCompanyId = action.payload;
      if (action.payload) {
        authStorage.setActiveCompanyId(action.payload);
      } else {
        authStorage.clearActiveCompanyId();
      }
    },
    setBootstrapped(state, action: PayloadAction<boolean>) {
      state.isBootstrapped = action.payload;
    },
    clearSession(state) {
      state.activeCompanyId = null;
      state.isBootstrapped = true;
      authStorage.clearAll();
    },
    setTokens(
      _state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>,
    ) {
      authStorage.setAccessToken(action.payload.accessToken);
      authStorage.setRefreshToken(action.payload.refreshToken);
    },
  },
});

export const { setActiveCompanyId, setBootstrapped, clearSession, setTokens } =
  authSlice.actions;

export const authReducer = authSlice.reducer;
