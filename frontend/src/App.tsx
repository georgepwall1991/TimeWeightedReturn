import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store/store';
import AppLayout from './components/layout/AppLayout';
import { ErrorBoundary } from './components/layout';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthInitializer } from './components/auth/AuthInitializer';
import { AuthErrorBoundary } from './components/auth/AuthErrorBoundary';
import { errorService } from './services/errorService';
import './index.css';

// Set up global error handlers
errorService.setupGlobalErrorHandlers();

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AuthErrorBoundary>
          <BrowserRouter>
            <AuthInitializer />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthErrorBoundary>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
