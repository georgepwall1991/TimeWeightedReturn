import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Target, BarChart3, Filter, ArrowUpDown, AlertCircle } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useGetAccountHoldingsQuery } from '../../services/api';

interface ContributionData {
  instrumentId: string;
  ticker: string;
  name: string;
  startWeight: number;
  endWeight: number;
  weightChange: number;
  instrumentReturn: number;
  contribution: number;
  startValue: number;
  endValue: number;
  valueChange: number;
  type: 'Cash' | 'Security';
}

type SortField = 'contribution' | 'instrumentReturn' | 'endWeight' | 'ticker';

interface ContributionDashboardProps {
  accountId: string;
  accountName?: string;
  period: string;
  totalReturn: number;
  date?: string; // Date for holdings
}

const ContributionDashboard: React.FC<ContributionDashboardProps> = ({
  accountId,
  accountName,
  period,
  totalReturn,
  date,
}) => {
  const [sortBy, setSortBy] = useState<SortField>('contribution');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative'>('all');

  // Fetch real account holdings data
  const {
    data: holdingsData,
    isLoading,
    error
  } = useGetAccountHoldingsQuery({
    accountId,
    date: date || new Date().toISOString().split('T')[0] // Default to today
  });

  // Calculate contribution data (mock calculation for demo - will be replaced with real calculation service)
  const contributionData = useMemo(() => {
    if (!holdingsData?.holdings) return [];

    const holdings = holdingsData.holdings;
    const totalValue = holdings.reduce((sum, h) => sum + h.valueGBP, 0);

    return holdings.map((holding): ContributionData => {
      // Mock historical data for demonstration
      const startValue = holding.valueGBP * (0.9 + Math.random() * 0.2); // ±10% variation
      const endValue = holding.valueGBP;
      const valueChange = endValue - startValue;

      const startWeight = startValue / (totalValue * 0.95); // Assume portfolio was slightly smaller
      const endWeight = endValue / totalValue;
      const weightChange = endWeight - startWeight;

      const instrumentReturn = startValue > 0 ? valueChange / startValue : 0;
      const contribution = startWeight * instrumentReturn +
                          (weightChange * instrumentReturn / 2); // Simplified attribution

      return {
        instrumentId: holding.instrumentId,
        ticker: holding.ticker,
        name: holding.name || holding.ticker,
        startWeight,
        endWeight,
        weightChange,
        instrumentReturn,
        contribution,
        startValue,
        endValue,
        valueChange,
        type: holding.instrumentType,
      };
    });
  }, [holdingsData]);

  // Type-safe accessor function for sorting
  const getSortValue = (item: ContributionData, field: SortField): number | string => {
    switch (field) {
      case 'ticker':
        return item.ticker;
      case 'contribution':
        return item.contribution;
      case 'instrumentReturn':
        return item.instrumentReturn;
      case 'endWeight':
        return item.endWeight;
      default:
        return 0;
    }
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = contributionData;

    // Apply filter
    switch (filterType) {
      case 'positive':
        filtered = filtered.filter(item => item.contribution > 0);
        break;
      case 'negative':
        filtered = filtered.filter(item => item.contribution < 0);
        break;
    }

    // Apply sort (create a copy to avoid mutating Redux state)
    const sorted = [...filtered].sort((a, b) => {
      const aValue = getSortValue(a, sortBy);
      const bValue = getSortValue(b, sortBy);

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const numA = typeof aValue === 'number' ? aValue : 0;
      const numB = typeof bValue === 'number' ? bValue : 0;

      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });

    return sorted;
  }, [contributionData, sortBy, sortDirection, filterType]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalContribution = contributionData.reduce((sum, item) => sum + item.contribution, 0);
    const positiveContribution = contributionData.filter(item => item.contribution > 0)
      .reduce((sum, item) => sum + item.contribution, 0);
    const negativeContribution = contributionData.filter(item => item.contribution < 0)
      .reduce((sum, item) => sum + item.contribution, 0);

    const topContributor = contributionData.length > 0 ? contributionData.reduce((max, item) =>
      item.contribution > max.contribution ? item : max
    ) : null;
    const bottomContributor = contributionData.length > 0 ? contributionData.reduce((min, item) =>
      item.contribution < min.contribution ? item : min
    ) : null;

    return {
      totalContribution,
      positiveContribution,
      negativeContribution,
      topContributor,
      bottomContributor,
      numberOfHoldings: contributionData.length,
    };
  }, [contributionData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <div className="flex items-center space-x-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Error Loading Holdings</h3>
              <p className="text-sm text-red-500">
                Failed to load account holdings. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!holdingsData?.holdings?.length) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Holdings Found</h3>
            <p className="text-gray-600">
              No holdings found for {accountName || 'this account'} on {holdingsData?.actualDate || date}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayAccountName = accountName || holdingsData.accountName || 'Account';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Contribution Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">
              {displayAccountName} • {period} • {summary.numberOfHoldings} holdings
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Holdings as of {holdingsData.actualDate} • Total Value: {formatCurrency(holdingsData.totalValueGBP)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatPercentage(totalReturn)}
            </div>
            <div className="text-sm text-gray-600">Total Return</div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-green-600 uppercase tracking-wide font-medium">Positive</div>
                <div className="text-lg font-bold text-green-600">
                  {formatPercentage(summary.positiveContribution)}
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-xs text-gray-600 mt-1">Gains contribution</div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-red-600 uppercase tracking-wide font-medium">Negative</div>
                <div className="text-lg font-bold text-red-600">
                  {formatPercentage(summary.negativeContribution)}
                </div>
              </div>
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-xs text-gray-600 mt-1">Losses contribution</div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-600 uppercase tracking-wide font-medium">Top Contributor</div>
                <div className="text-sm font-bold text-blue-600 truncate">
                  {summary.topContributor?.ticker || 'N/A'}
                </div>
                <div className="text-xs text-blue-600">
                  {summary.topContributor ? formatPercentage(summary.topContributor.contribution) : 'N/A'}
                </div>
              </div>
              <Target className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-orange-600 uppercase tracking-wide font-medium">Bottom Contributor</div>
                <div className="text-sm font-bold text-orange-600 truncate">
                  {summary.bottomContributor?.ticker || 'N/A'}
                </div>
                <div className="text-xs text-orange-600">
                  {summary.bottomContributor ? formatPercentage(summary.bottomContributor.contribution) : 'N/A'}
                </div>
              </div>
              <BarChart3 className="w-5 h-5 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Holdings</option>
              <option value="positive">Positive Contributors</option>
              <option value="negative">Negative Contributors</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={`${sortBy}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortBy(field as SortField);
                setSortDirection(direction as typeof sortDirection);
              }}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="contribution-desc">Contribution (High to Low)</option>
              <option value="contribution-asc">Contribution (Low to High)</option>
              <option value="instrumentReturn-desc">Return (High to Low)</option>
              <option value="instrumentReturn-asc">Return (Low to High)</option>
              <option value="endWeight-desc">Weight (High to Low)</option>
              <option value="endWeight-asc">Weight (Low to High)</option>
              <option value="ticker-asc">Ticker (A to Z)</option>
              <option value="ticker-desc">Ticker (Z to A)</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedData.length} of {contributionData.length} holdings
          </div>
        </div>
      </div>

      {/* Contribution Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Holding
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contribution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visual Impact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedData.map((item) => {
                const maxAbsContribution = Math.max(...contributionData.map(d => Math.abs(d.contribution)));
                const barWidth = maxAbsContribution > 0 ? Math.abs(item.contribution / maxAbsContribution) * 100 : 0;

                return (
                  <tr key={item.instrumentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.ticker}</div>
                          <div className="text-xs text-gray-500">{item.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatPercentage(item.endWeight)}
                      </div>
                      <div className={`text-xs ${
                        item.weightChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.weightChange >= 0 ? '+' : ''}{formatPercentage(item.weightChange)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        item.instrumentReturn >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(item.instrumentReturn)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${
                        item.contribution >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(item.contribution)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(item.endValue)}
                      </div>
                      <div className={`text-xs ${
                        item.valueChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.valueChange >= 0 ? '+' : ''}{formatCurrency(item.valueChange)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              item.contribution >= 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{
                              width: `${barWidth}%`,
                              marginLeft: item.contribution < 0 ? `${100 - barWidth}%` : '0%',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContributionDashboard;
