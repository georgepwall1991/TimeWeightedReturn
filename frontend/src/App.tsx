import { Provider } from 'react-redux';
import { store } from './store/store';
import AppLayout from './components/layout/AppLayout';
import { ErrorBoundary } from './components/layout';
import { errorService } from './services/errorService';
import './index.css';

// Set up global error handlers
errorService.setupGlobalErrorHandlers();

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppLayout />
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
