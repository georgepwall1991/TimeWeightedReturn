import { Provider } from 'react-redux';
import { store } from './store/store';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import { ErrorBoundary } from './components/layout';
import { errorService } from './services/errorService';
import './index.css';

// Set up global error handlers
errorService.setupGlobalErrorHandlers();

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/portfolio-tree" element={<AppLayout />} />
          </Routes>
        </Router>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
