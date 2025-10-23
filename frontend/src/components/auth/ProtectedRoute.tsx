import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectRefreshToken } from '../../store/authSlice';
import { AuthLoadingScreen } from './AuthLoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const refreshToken = useSelector(selectRefreshToken);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Give the AuthInitializer a moment to try refreshing the token
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while initializing
  if (isInitializing && refreshToken) {
    return <AuthLoadingScreen />;
  }

  // If not authenticated and no refresh token, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
