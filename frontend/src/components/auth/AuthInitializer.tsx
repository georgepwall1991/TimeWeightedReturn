import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectRefreshToken, selectAccessToken, setCredentials, logout } from '../../store/authSlice';
import { useRefreshTokenMutation, useGetCurrentUserQuery } from '../../services/api';

/**
 * Component that initializes authentication state on app load
 * - Checks for stored refresh token
 * - Attempts to refresh the access token if refresh token exists
 * - Fetches current user data if tokens are valid
 */
export const AuthInitializer: React.FC = () => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const refreshToken = useSelector(selectRefreshToken);
  const accessToken = useSelector(selectAccessToken);
  const [refreshTokenMutation] = useRefreshTokenMutation();

  // Only fetch current user if we have an access token and are authenticated
  const { data: userData } = useGetCurrentUserQuery(undefined, {
    skip: !accessToken || !isInitialized,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      // If we already have an access token, we're good
      if (accessToken) {
        setIsInitialized(true);
        return;
      }

      // If we have a refresh token but no access token, clear orphaned token
      // (This shouldn't happen with current storage logic)
      if (refreshToken && !accessToken) {
        console.warn('Found orphaned refresh token without access token, clearing auth state');
        dispatch(logout());
      }

      setIsInitialized(true);
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [refreshToken, accessToken, refreshTokenMutation, dispatch, isInitialized]);

  // Update user data in state when fetched
  useEffect(() => {
    if (userData && accessToken && refreshToken) {
      // Get the current expires at from localStorage
      const expiresAt = localStorage.getItem('expiresAt') || '';

      // Update Redux state with the fetched user data
      dispatch(setCredentials({
        accessToken,
        refreshToken,
        user: userData,
        expiresAt,
      }));
    }
  }, [userData, accessToken, refreshToken, dispatch]);

  // This component doesn't render anything
  return null;
};
