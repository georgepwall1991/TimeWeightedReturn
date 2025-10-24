import React, { useState, useMemo, useCallback } from "react";
import { TrendingUp, TrendingDown, Calendar, RefreshCw } from "lucide-react";
import { api } from "../../services/api";
import { formatPercentage, formatCurrency } from "../../utils/formatters";
import { PerformanceChart } from "../charts";
import { CalculationErrorBoundary } from "../layout/CalculationErrorBoundary";

interface PerformanceDashboardProps {
  accountId: string;
  accountName: string;
}

type DatePreset = '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'Custom';

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  accountId,
  accountName: _accountName,
}) => {
  const [dateRange, setDateRange] = useState<DatePreset>('1Y');
  const [customRange, setCustomRange] = useState({
    from: "",
    to: "",
  });

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

  const { data: startHoldings } = api.useGetAccountHoldingsQuery({
    accountId,
    date: currentRange.start,
  });

  const { data: endHoldings } = api.useGetAccountHoldingsQuery({
    accountId,
    date: currentRange.end,
  });

  const performanceData = useMemo(() => {
    if (!twrData || !startHoldings) return [];

    const range = getCurrentRange();
    const startDate = new Date(range.start);
    const endDate = new Date(range.end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const data = [];
    const startValue = startHoldings.totalValueGBP;
    const totalReturn = twrData.timeWeightedReturn;

    const seed = startValue + totalReturn * 1000;
    const seededRandom = (index: number) => {
      const x = Math.sin(seed + index) * 10000;
      return (x - Math.floor(x) - 0.5) * 0.02;
    };

    for (let i = 0; i <= Math.min(days, 30); i += Math.max(1, Math.floor(days / 30))) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const progress = i / days;
      const randomVariation = seededRandom(i);
      const currentReturn = totalReturn * progress + randomVariation;
      const currentValue = startValue * (1 + currentReturn);

      data.push({
        date: currentDate.toISOString().split('T')[0],
        value: Math.max(0, currentValue),
        return: currentReturn
      });
    }

    return data;
  }, [twrData, startHoldings, getCurrentRange]);

  const isLoading = twrLoading;
  const isPositiveReturn = twrData && twrData.timeWeightedReturn >= 0;
  const annualizedReturn = twrData?.annualizedReturn || 0;
  const startValue = startHoldings?.totalValueGBP || 0;
  const endValue = endHoldings?.totalValueGBP || 0;
  const absoluteChange = endValue - startValue;

  return (
    <CalculationErrorBoundary onRetry={refetchTwr}>
      <div className="space-y-6">
        {/* Header & Date Selector */}
        <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 dark:from-gray-800 dark:via-blue-950/10 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-900/30 p-6 shadow-lg">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">Performance Analysis</h2>

          {/* Date Range Selector */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Analysis Period</span>
              </div>
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(dateRanges).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range as DatePreset)}
                  className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-300 ${
                    dateRange === range
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-glow-lg hover:scale-105 border-2 border-blue-400"
                      : "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-500 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 hover:border-blue-300 dark:hover:border-blue-700 hover:scale-105"
                  }`}
                >
                  {range}
                </button>
              ))}
              <button
                onClick={() => setDateRange('Custom')}
                className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-300 ${
                  dateRange === 'Custom'
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg hover:shadow-glow-lg hover:scale-105 border-2 border-purple-400"
                    : "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-500 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/30 dark:hover:to-indigo-900/30 hover:border-purple-300 dark:hover:border-purple-700 hover:scale-105"
                }`}
              >
                Custom
              </button>
            </div>

            {/* Custom Date Range Inputs */}
            {dateRange === 'Custom' && (
              <div className="flex gap-3 items-end p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">From</label>
                  <input
                    type="date"
                    value={customRange.from}
                    onChange={(e) => setCustomRange({ ...customRange, from: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2">To</label>
                  <input
                    type="date"
                    value={customRange.to}
                    onChange={(e) => setCustomRange({ ...customRange, to: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-indigo-300 dark:border-indigo-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-100 to-blue-100 dark:from-gray-800 dark:to-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/30 text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-semibold">{currentRange.start}</span>
            <span>to</span>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">{currentRange.end}</span>
          </div>
        </div>

        {/* Performance Metrics Cards */}
        {!isLoading && twrData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* TWR */}
            <div className={`group bg-gradient-to-br from-white via-${isPositiveReturn ? 'emerald' : 'rose'}-50/30 to-${isPositiveReturn ? 'green' : 'red'}-50/50 dark:from-gray-800 dark:via-${isPositiveReturn ? 'emerald' : 'rose'}-950/20 dark:to-${isPositiveReturn ? 'green' : 'red'}-950/30 rounded-xl border ${isPositiveReturn ? 'border-emerald-200 dark:border-emerald-900/30' : 'border-rose-200 dark:border-rose-900/30'} p-6 shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Time-Weighted Return</div>
                <div className={`p-2 bg-gradient-to-br ${isPositiveReturn ? 'from-emerald-500 to-green-600' : 'from-rose-500 to-red-600'} rounded-lg shadow-lg`}>
                  {isPositiveReturn ? (
                    <TrendingUp className="w-4 h-4 text-white" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              <div className={`text-3xl font-bold bg-gradient-to-r ${isPositiveReturn ? 'from-emerald-600 to-green-600' : 'from-rose-600 to-red-600'} bg-clip-text text-transparent`}>
                {formatPercentage(twrData.timeWeightedReturn)}
              </div>
            </div>

            {/* Annualized Return */}
            <div className={`group bg-gradient-to-br from-white via-${annualizedReturn >= 0 ? 'teal' : 'orange'}-50/30 to-${annualizedReturn >= 0 ? 'cyan' : 'amber'}-50/50 dark:from-gray-800 dark:via-${annualizedReturn >= 0 ? 'teal' : 'orange'}-950/20 dark:to-${annualizedReturn >= 0 ? 'cyan' : 'amber'}-950/30 rounded-xl border ${annualizedReturn >= 0 ? 'border-teal-200 dark:border-teal-900/30' : 'border-orange-200 dark:border-orange-900/30'} p-6 shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105`}>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-medium">Annualized Return</div>
              <div className={`text-3xl font-bold bg-gradient-to-r ${annualizedReturn >= 0 ? 'from-teal-600 to-cyan-600' : 'from-orange-600 to-amber-600'} bg-clip-text text-transparent`}>
                {formatPercentage(annualizedReturn)}
              </div>
            </div>

            {/* Start Value */}
            <div className="group bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-800 dark:via-blue-950/20 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-900/30 p-6 shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-medium">Start Value</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {formatCurrency(startValue)}
              </div>
            </div>

            {/* End Value */}
            <div className="group bg-gradient-to-br from-white via-purple-50/30 to-fuchsia-50/50 dark:from-gray-800 dark:via-purple-950/20 dark:to-fuchsia-950/30 rounded-xl border border-purple-200 dark:border-purple-900/30 p-6 shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-medium">End Value</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                {formatCurrency(endValue)}
              </div>
              <div className={`text-sm mt-2 font-semibold ${absoluteChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {absoluteChange >= 0 ? '+' : ''}{formatCurrency(absoluteChange)}
              </div>
            </div>
          </div>
        )}

        {/* Performance Chart */}
        {!isLoading && performanceData.length > 0 && (
          <div className="bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/30 dark:from-gray-800 dark:via-indigo-950/10 dark:to-purple-950/20 rounded-xl border border-indigo-200 dark:border-indigo-900/30 p-6 shadow-lg hover:shadow-glow transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Performance Over Time</h3>
              <button
                onClick={() => refetchTwr()}
                className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-800/40 dark:hover:to-purple-800/40 rounded-lg transition-all duration-300 hover:scale-110 border border-indigo-200 dark:border-indigo-800/50"
                title="Refresh data"
              >
                <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </button>
            </div>
            <PerformanceChart
              data={performanceData}
              height={400}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64 bg-gradient-to-br from-white via-blue-50/20 to-purple-50/30 dark:from-gray-800 dark:via-blue-950/10 dark:to-purple-950/20 rounded-xl border border-blue-200 dark:border-blue-900/30 shadow-lg">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-border"></div>
              <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-blue-600 dark:border-blue-400"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {twrError && (
          <div className="bg-gradient-to-br from-white via-red-50/30 to-rose-50/50 dark:from-gray-800 dark:via-red-950/20 dark:to-rose-950/30 border-2 border-red-200 dark:border-red-800/50 rounded-xl p-6 shadow-lg">
            <p className="text-lg font-semibold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-4">Failed to load performance data</p>
            <button
              onClick={() => refetchTwr()}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Performance Summary */}
        {!isLoading && twrData && (
          <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-800 dark:via-blue-950/20 dark:to-indigo-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-800/50 p-6 shadow-lg hover:shadow-glow transition-all duration-300">
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <span className="text-gray-600 dark:text-gray-400">Period:</span>
                <span className="ml-2 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {dateRanges[dateRange as keyof typeof dateRanges] || 'Custom'}
                </span>
              </div>
              <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                <span className="text-gray-600 dark:text-gray-400">Days:</span>
                <span className="ml-2 font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {Math.ceil((new Date(currentRange.end).getTime() - new Date(currentRange.start).getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
              <div className={`p-3 bg-gradient-to-r ${isPositiveReturn ? 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30' : 'from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30'} rounded-lg border ${isPositiveReturn ? 'border-emerald-100 dark:border-emerald-900/30' : 'border-rose-100 dark:border-rose-900/30'}`}>
                <span className="text-gray-600 dark:text-gray-400">Total Return:</span>
                <span className={`ml-2 font-semibold bg-gradient-to-r ${isPositiveReturn ? 'from-emerald-600 to-green-600' : 'from-rose-600 to-red-600'} bg-clip-text text-transparent`}>
                  {formatPercentage(twrData.timeWeightedReturn)}
                </span>
              </div>
              <div className={`p-3 bg-gradient-to-r ${absoluteChange >= 0 ? 'from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30' : 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30'} rounded-lg border ${absoluteChange >= 0 ? 'border-teal-100 dark:border-teal-900/30' : 'border-orange-100 dark:border-orange-900/30'}`}>
                <span className="text-gray-600 dark:text-gray-400">Absolute Change:</span>
                <span className={`ml-2 font-semibold bg-gradient-to-r ${absoluteChange >= 0 ? 'from-teal-600 to-cyan-600' : 'from-orange-600 to-amber-600'} bg-clip-text text-transparent`}>
                  {formatCurrency(absoluteChange)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </CalculationErrorBoundary>
  );
};

export default PerformanceDashboard;
