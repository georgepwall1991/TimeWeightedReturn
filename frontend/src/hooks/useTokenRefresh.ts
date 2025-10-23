import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAccessToken, selectRefreshToken, updateAccessToken, logout } from '../store/authSlice';
import { useRefreshTokenMutation } from '../services/api';

/**
 * Hook that automatically refreshes the access token before it expires
 * Refreshes 2 minutes before expiration
 */
export const useTokenRefresh = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector(selectAccessToken);
  const refreshToken = useSelector(selectRefreshToken);
  const [refreshTokenMutation] = useRefreshTokenMutation();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  };

  const scheduleTokenRefresh = (token: string) => {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) {
      return;
    }

    const expiresAt = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    // Refresh 2 minutes before expiration
    const refreshTime = timeUntilExpiry - 2 * 60 * 1000;

    // If token expires in less than 2 minutes, refresh immediately
    const delay = Math.max(0, refreshTime);

    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setTimeout(async () => {
      if (!accessToken || !refreshToken) {
        return;
      }

      try {
        const response = await refreshTokenMutation({
          accessToken,
          refreshToken,
        }).unwrap();

        dispatch(
          updateAccessToken({
            accessToken: response.accessToken,
            expiresAt: response.expiresAt,
          })
        );

        // Schedule next refresh
        scheduleTokenRefresh(response.accessToken);
      } catch (error) {
        console.error('Token refresh failed:', error);
        // If refresh fails, log the user out
        dispatch(logout());
      }
    }, delay);
  };

  useEffect(() => {
    if (accessToken) {
      scheduleTokenRefresh(accessToken);
    }

    // Cleanup timeout on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [accessToken, refreshToken]);

  return null;
};
