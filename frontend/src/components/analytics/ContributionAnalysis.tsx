import React, { useMemo, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, Target, Filter, Calendar, RefreshCw } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { api } from '../../services/api';
import { ContributionChart } from '../charts';
import { CalculationErrorBoundary } from '../layout/CalculationErrorBoundary';

interface ContributionAnalysisProps {
  accountId: string;
  accountName: string;
}

type DatePreset = '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'Custom';
type SortField = 'contribution' | 'instrumentReturn' | 'weight' | 'ticker';

const ContributionAnalysis: React.FC<ContributionAnalysisProps> = ({
  accountId,
  accountName: _accountName,
}) => {
  const [dateRange, setDateRange] = useState<DatePreset>('1Y');
  const [customRange, setCustomRange] = useState({
    from: "",
    to: "",
  });
  const [sortBy, setSortBy] = useState<SortField>('contribution');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative'>('all');

  const dateRanges = {
    '1M': '1 Month',
    '3M': '3 Months',
    '6M': '6 Months',
    '1Y': '1 Year',
    'YTD': 'Year to Date'
  };

  const getCurrentRange = useCallback((): { start: string; end: string } => {
    if (dateRange === 'Custom') {
      return {
        start: customRange.from,
        end: customRange.to
      };
    }

    const end = new Date();
    const start = new Date();

    switch (dateRange) {
      case '1M':
        start.setMonth(start.getMonth() - 1);
        break;
      case '3M':
        start.setMonth(start.getMonth() - 3);
        break;
      case '6M':
        start.setMonth(start.getMonth() - 6);
        break;
      case '1Y':
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'YTD':
        start.setFullYear(start.getFullYear(), 0, 1);
        break;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }, [dateRange, customRange]);

  const currentRange = useMemo(() => getCurrentRange(), [getCurrentRange]);

  const {
    data: contributionData,
    isLoading: contributionLoading,
    error: contributionError,
    refetch: refetchContribution,
  } = api.useCalculateContributionQuery(
    {
      accountId,
      startDate: currentRange.start,
      endDate: currentRange.end,
    },
    {
      skip: dateRange === 'Custom' && (!customRange.from || !customRange.to),
    }
  );

  // Transform contribution data for chart
  const contributionChartData = useMemo(() => {
    if (!contributionData?.instrumentContributions) return [];

    return contributionData.instrumentContributions.map(item => ({
      ticker: item.ticker,
      name: item.name,
      contribution: item.contribution,
      absoluteContribution: item.absoluteContribution,
      weight: item.weight,
      instrumentReturn: item.instrumentReturn,
      type: item.type
    }));
  }, [contributionData]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!contributionChartData) return [];

    let filtered = contributionChartData;

    // Apply filter
    switch (filterType) {
      case 'positive':
        filtered = filtered.filter(item => item.contribution > 0);
        break;
      case 'negative':
        filtered = filtered.filter(item => item.contribution < 0);
        break;
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'ticker':
          return sortDirection === 'asc'
            ? a.ticker.localeCompare(b.ticker)
            : b.ticker.localeCompare(a.ticker);
        case 'contribution':
          aValue = a.contribution;
          bValue = b.contribution;
          break;
        case 'instrumentReturn':
          aValue = a.instrumentReturn;
          bValue = b.instrumentReturn;
          break;
        case 'weight':
          aValue = a.weight;
          bValue = b.weight;
          break;
        default:
          aValue = a.contribution;
          bValue = b.contribution;
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }, [contributionChartData, sortBy, sortDirection, filterType]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!contributionChartData) return null;

    const totalContribution = contributionChartData.reduce((sum, item) => sum + item.contribution, 0);
    const positiveContribution = contributionChartData.filter(item => item.contribution > 0)
      .reduce((sum, item) => sum + item.contribution, 0);
    const negativeContribution = contributionChartData.filter(item => item.contribution < 0)
      .reduce((sum, item) => sum + item.contribution, 0);

    return {
      totalContribution,
      positiveContribution,
      negativeContribution,
      positiveCount: contributionChartData.filter(item => item.contribution > 0).length,
      negativeCount: contributionChartData.filter(item => item.contribution < 0).length,
      totalCount: contributionChartData.length,
    };
  }, [contributionChartData]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const isLoading = contributionLoading;

  return (
    <CalculationErrorBoundary onRetry={refetchContribution}>
      <div className="space-y-6">
        {/* Header & Date Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Contribution Analysis</h2>

          {/* Date Range Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Calendar className="w-4 h-4 inline mr-2" />
              Analysis Period
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(dateRanges).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range as DatePreset)}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                    dateRange === range
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-600"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {range}
                </button>
              ))}
              <button
                onClick={() => setDateRange('Custom')}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                  dateRange === 'Custom'
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Custom
              </button>
            </div>

            {dateRange === 'Custom' && (
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">From</label>
                  <input
                    type="date"
                    value={customRange.from}
                    onChange={(e) => setCustomRange({ ...customRange, from: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">To</label>
                  <input
                    type="date"
                    value={customRange.to}
                    onChange={(e) => setCustomRange({ ...customRange, to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        {!isLoading && summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">Positive Contributors</div>
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatPercentage(summary.positiveContribution)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {summary.positiveCount} holdings
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">Negative Contributors</div>
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatPercentage(summary.negativeContribution)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {summary.negativeCount} holdings
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">Net Contribution</div>
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className={`text-2xl font-bold ${summary.totalContribution >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatPercentage(summary.totalContribution)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {summary.totalCount} total holdings
              </div>
            </div>
          </div>
        )}

        {/* Contribution Chart */}
        {!isLoading && contributionChartData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Contributors</h3>
              <button
                onClick={() => refetchContribution()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <ContributionChart
              data={contributionChartData.slice(0, 10)}
              height={400}
            />
          </div>
        )}

        {/* Filters and Table */}
        {!isLoading && contributionChartData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">All Holdings</h3>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-gray-200"
                  >
                    <option value="all">All Holdings</option>
                    <option value="positive">Positive Only</option>
                    <option value="negative">Negative Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort('ticker')}
                    >
                      <div className="flex items-center">
                        Holding
                        {sortBy === 'ticker' && <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort('contribution')}
                    >
                      <div className="flex items-center justify-end">
                        Contribution
                        {sortBy === 'contribution' && <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort('instrumentReturn')}
                    >
                      <div className="flex items-center justify-end">
                        Return
                        {sortBy === 'instrumentReturn' && <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort('weight')}
                    >
                      <div className="flex items-center justify-end">
                        Weight
                        {sortBy === 'weight' && <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Absolute
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAndSortedData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.ticker}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-medium ${item.contribution >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatPercentage(item.contribution)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm ${item.instrumentReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatPercentage(item.instrumentReturn)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-gray-100">
                        {formatPercentage(item.weight)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.absoluteContribution)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        )}

        {/* Error State */}
        {contributionError && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-6">
            <p className="text-red-600 dark:text-red-400">Failed to load contribution data</p>
            <button
              onClick={() => refetchContribution()}
              className="mt-4 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </CalculationErrorBoundary>
  );
};

export default ContributionAnalysis;
