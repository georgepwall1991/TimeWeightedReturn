import React, { useState, useMemo, useCallback } from "react";
import { TrendingUp, BarChart3, PieChart, Calendar, Target } from "lucide-react";
import { api } from "../../services/api";
import { formatPercentage, formatCurrency } from "../../utils/formatters";
import { PerformanceChart, ContributionChart } from "../charts";
import { CalculationErrorBoundary } from "../layout/CalculationErrorBoundary";

interface AdvancedAnalyticsDashboardProps {
  accountId: string;
  accountName: string;
}

type DatePreset = '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'Custom';

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
    accountId,
    accountName,
  }) => {
   const [dateRange, setDateRange] = useState<DatePreset>('1Y');
   const [customRange, setCustomRange] = useState({
     from: "",
     to: "",
   });

   // Define date ranges
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

  // Fetch TWR and Contribution data
  const {
    data: twrData,
    isLoading: twrLoading,
    error: twrError,
    refetch: refetchTwr,
  } = api.useCalculateTWRQuery(
    {
      accountId,
      from: currentRange.start,
      to: currentRange.end,
    },
    {
      skip: dateRange === 'Custom' && (!customRange.from || !customRange.to),
    }
  );

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

  // Generate sample performance data for demonstration
  const performanceData = useMemo(() => {
    if (!twrData) return [];

    const range = getCurrentRange();
    const startDate = new Date(range.start);
    const endDate = new Date(range.end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const data = [];
    const startValue = contributionData?.startValueGBP || 100000;
    const totalReturn = twrData.timeWeightedReturn;

    for (let i = 0; i <= Math.min(days, 30); i += Math.max(1, Math.floor(days / 30))) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const progress = i / days;
      const randomVariation = (Math.random() - 0.5) * 0.02;
      const currentReturn = totalReturn * progress + randomVariation;
      const currentValue = startValue * (1 + currentReturn);

      data.push({
        date: currentDate.toISOString().split('T')[0],
        value: Math.max(0, currentValue),
        return: currentReturn
      });
    }

    return data;
  }, [twrData, contributionData, getCurrentRange]);

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

  const isLoading = twrLoading || contributionLoading;
  const hasError = twrError || contributionError;
  const isPositiveReturn = twrData && twrData.timeWeightedReturn >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Advanced Analytics Dashboard
              </h2>
              <p className="text-sm text-gray-600">{accountName}</p>
            </div>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
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
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-300 shadow-sm"
                    : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-300"
                }`}
              >
                {range}
              </button>
            ))}
            <button
              onClick={() => setDateRange("Custom")}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                dateRange === "Custom"
                  ? "bg-blue-100 text-blue-700 border-2 border-blue-300 shadow-sm"
                  : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-300"
              }`}
            >
              Custom
            </button>
          </div>

          {/* Custom Date Range */}
          {dateRange === "Custom" && (
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={customRange.from}
                  onChange={(e) =>
                    setCustomRange((prev) => ({ ...prev, from: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={customRange.to}
                  onChange={(e) =>
                    setCustomRange((prev) => ({ ...prev, to: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Key Metrics Summary */}
        {twrData && contributionData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Return</p>
                  <p className={`text-2xl font-bold ${
                    isPositiveReturn ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(twrData.timeWeightedReturn)}
                  </p>
                </div>
                <TrendingUp className={`w-8 h-8 ${
                  isPositiveReturn ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Annualized</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPercentage(twrData.annualizedReturn || 0)}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Start Value</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(contributionData.startValueGBP)}
                  </p>
                </div>
                <PieChart className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">End Value</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {formatCurrency(contributionData.endValueGBP)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading analytics...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            {/* TWR Error */}
            {twrError && (
              <CalculationErrorBoundary
                error={twrError}
                accountId={accountId}
                accountName={accountName}
                startDate={currentRange.start}
                endDate={currentRange.end}
                calculationType="TWR"
                onRetry={refetchTwr}
              />
            )}

            {/* Contribution Error */}
            {contributionError && (
              <CalculationErrorBoundary
                error={contributionError}
                accountId={accountId}
                accountName={accountName}
                startDate={currentRange.start}
                endDate={currentRange.end}
                calculationType="CONTRIBUTION"
                onRetry={refetchContribution}
              />
            )}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      {!isLoading && !hasError && twrData && contributionData && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <CalculationErrorBoundary onRetry={() => refetchTwr()}>
            <PerformanceChart
              data={performanceData}
              title={`${accountName} Performance Over Time`}
              height={350}
              color={isPositiveReturn ? "#10B981" : "#EF4444"}
            />
          </CalculationErrorBoundary>

          {/* Contribution Analysis Chart */}
          <CalculationErrorBoundary onRetry={() => refetchContribution()}>
            <ContributionChart
              data={contributionChartData}
              title="Performance Contribution Analysis"
              height={350}
              showTop={8}
            />
          </CalculationErrorBoundary>
        </div>
      )}

      {/* Additional Analytics Section */}
      {!isLoading && !hasError && contributionData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top & Bottom Contributors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-green-600 mb-2">Best Performer</h4>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="font-semibold text-green-800">
                  {contributionData.topContributorTicker}
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatPercentage(contributionData.topContributorReturn)}
                </div>
                <div className="text-sm text-green-600">Contribution to return</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-red-600 mb-2">Worst Performer</h4>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="font-semibold text-red-800">
                  {contributionData.worstContributorTicker}
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {formatPercentage(contributionData.worstContributorReturn)}
                </div>
                <div className="text-sm text-red-600">Contribution to return</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
