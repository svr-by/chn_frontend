import { useNavigate } from 'react-router-dom';

import { useLogoutMutation } from '@/api/endpoints/authApi';
import { baseApi } from '@/api/baseApi';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { authStorage } from '@/lib/authStorage';
import { clearSession } from '@/store/slices/authSlice';

export function useLogout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logout, { isLoading }] = useLogoutMutation();

  async function performLogout() {
    const refreshToken = authStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await logout({ refreshToken }).unwrap();
      }
    } catch {
      dispatch(clearSession());
      dispatch(baseApi.util.resetApiState());
    } finally {
      navigate('/login', { replace: true });
    }
  }

  return { logout: performLogout, isLoggingOut: isLoading };
}
