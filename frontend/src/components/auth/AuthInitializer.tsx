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

      // If we have a refresh token but no access token, try to refresh
      if (refreshToken) {
        try {
          // We need a dummy access token for the refresh request
          // The API will validate the refresh token
          const response = await refreshTokenMutation({
            accessToken: '', // Empty string as placeholder
            refreshToken,
          }).unwrap();

          dispatch(setCredentials(response));
        } catch (error) {
          console.error('Failed to refresh token on init:', error);
          // If refresh fails, clear everything
          dispatch(logout());
        }
      }

      setIsInitialized(true);
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [refreshToken, accessToken, refreshTokenMutation, dispatch, isInitialized]);

  // Update user data in state when fetched
  useEffect(() => {
    if (userData && accessToken) {
      // User data is already in the store from login/register
      // This just ensures it's up-to-date if we refreshed the token
      const currentState = (window as any).__REDUX_STORE__;
      if (currentState?.auth?.user?.id !== userData.id) {
        // User data changed, update it (shouldn't normally happen)
        console.log('User data updated from server');
      }
    }
  }, [userData, accessToken]);

  // This component doesn't render anything
  return null;
};
