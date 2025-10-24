import { RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useGetMarketDataStatusQuery, useRefreshAllPricesMutation } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import Skeleton from '../common/Skeleton';
import { useToast } from '../../contexts/ToastContext';

export default function MarketDataPanel() {
  const { data: statusData, isLoading, error, refetch } = useGetMarketDataStatusQuery();
  const [refreshAllPrices, { isLoading: isRefreshing }] = useRefreshAllPricesMutation();
  const { success, error: showError } = useToast();

  const handleRefreshAll = async () => {
    try {
      const result = await refreshAllPrices({}).unwrap();
      success(`Updated ${result.updatedInstruments} of ${result.totalInstruments} instruments`);
      refetch();
    } catch (err) {
      showError('Failed to refresh prices. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Market Data Status</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>Failed to load market data status</p>
        </div>
      </div>
    );
  }

  const needsUpdate = statusData?.filter(s => s.needsUpdate) || [];
  const upToDate = statusData?.filter(s => !s.needsUpdate) || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Market Data Status
          </h2>
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh All Prices'}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Instruments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statusData?.length || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Up to Date</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                  {upToDate.length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Needs Update</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
                  {needsUpdate.length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Instruments List */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Instruments
          </h3>
          {statusData && statusData.length > 0 ? (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {statusData.map((instrument) => (
                <div
                  key={instrument.instrumentId}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {instrument.ticker}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {instrument.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      {instrument.lastPriceDate ? (
                        <>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Last updated: {formatDistanceToNow(new Date(instrument.lastPriceDate), { addSuffix: true })}
                          </span>
                          {instrument.lastPriceSource && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                              {instrument.lastPriceSource}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          No price data
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {instrument.needsUpdate ? (
                      <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                        <AlertCircle className="w-4 h-4" />
                        Needs update
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Current
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No instruments found
            </p>
          )}
        </div>
    </div>
  );
}
