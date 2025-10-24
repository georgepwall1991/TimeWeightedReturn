import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, TrendingUp } from 'lucide-react';
import MarketDataPanel from '../components/marketdata/MarketDataPanel';
import { UserMenu } from '../components/layout/UserMenu';

export default function Admin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Back to Portfolio Analytics"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="flex items-center space-x-2">
              <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  System administration and management
                </p>
              </div>
            </div>
          </div>
          <UserMenu />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>Portfolio Analytics</span>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">Admin</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            System Administration
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage market data, view system status, and configure application settings
          </p>
        </div>

        {/* Market Data Section */}
        <div className="space-y-6">
          <MarketDataPanel />

          {/* Future admin sections can be added here */}
          {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              User Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Coming soon...</p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
