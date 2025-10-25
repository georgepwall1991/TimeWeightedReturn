import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, PoundSterling, BarChart3, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer as RechartsResponsiveContainer } from 'recharts';
import { AnalyticsDashboardSkeleton } from '../common/Skeleton';

interface AccountDashboardProps {
  accountId: string;
  accountName: string;
  onNavigateToTab?: (tab: string) => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AccountDashboard: React.FC<AccountDashboardProps> = ({
  accountId,
  accountName: _accountName,
  onNavigateToTab
}) => {
  // Calculate date range (last 90 days)
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 90);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }, []);

  // Fetch data
  const { data: currentHoldings, isLoading: holdingsLoading } = api.useGetAccountHoldingsQuery({
    accountId,
    date: dateRange.end,
  });
  const { data: twrData, isLoading: twrLoading } = api.useCalculateTWRQuery({
    accountId,
    from: dateRange.start,
    to: dateRange.end,
  });
  const { data: riskData } = api.useCalculateRiskMetricsQuery({
    accountId,
    startDate: dateRange.start,
    endDate: dateRange.end,
    riskFreeRate: 0.02,
  }, {
    skip: !accountId,
  });
  const { data: historyData } = api.useGetAccountHoldingsHistoryQuery({
    accountId,
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  // Calculate top holdings for pie chart
  const topHoldingsData = useMemo(() => {
    if (!currentHoldings?.holdings) return [];

    return [...currentHoldings.holdings]
      .sort((a, b) => b.valueGBP - a.valueGBP)
      .slice(0, 5)
      .map(holding => ({
        name: holding.name || 'Unknown',
        value: holding.valueGBP,
      }));
  }, [currentHoldings]);

  // Prepare mini performance chart data
  const performanceChartData = useMemo(() => {
    if (!historyData?.historicalData) return [];

    return historyData.historicalData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      value: item.totalValueGBP,
    }));
  }, [historyData]);

  const isLoading = holdingsLoading || twrLoading;
  const totalValue = currentHoldings?.totalValueGBP || 0;
  const twr = twrData?.timeWeightedReturn || 0;
  const holdingsCount = currentHoldings?.holdings?.length || 0;
  const riskScore = riskData?.riskAssessment?.riskScore || 0;
  const isPositiveReturn = twr >= 0;

  if (isLoading) {
    return <AnalyticsDashboardSkeleton />;
  }

  const getRiskLabel = (score: number) => {
    if (score >= 7) return 'Low Risk';
    if (score >= 5) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="group bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/50 dark:from-gray-800 dark:via-purple-950/20 dark:to-indigo-950/30 rounded-xl border border-purple-100 dark:border-purple-900/30 p-6 shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-shadow duration-300">
              <PoundSterling className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">Total Value</div>
        </div>

        {/* TWR */}
        <div className={`group bg-gradient-to-br from-white via-${isPositiveReturn ? 'emerald' : 'rose'}-50/30 to-${isPositiveReturn ? 'green' : 'red'}-50/50 dark:from-gray-800 dark:via-${isPositiveReturn ? 'emerald' : 'rose'}-950/20 dark:to-${isPositiveReturn ? 'green' : 'red'}-950/30 rounded-xl border ${isPositiveReturn ? 'border-emerald-100 dark:border-emerald-900/30' : 'border-rose-100 dark:border-rose-900/30'} p-6 shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 bg-gradient-to-br ${isPositiveReturn ? 'from-emerald-500 to-green-600' : 'from-rose-500 to-red-600'} rounded-xl shadow-lg group-hover:shadow-${isPositiveReturn ? 'emerald' : 'rose'}-500/50 transition-shadow duration-300`}>
              {isPositiveReturn ? (
                <TrendingUp className="w-5 h-5 text-white" />
              ) : (
                <TrendingDown className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
          <div className={`text-3xl font-bold bg-gradient-to-r ${isPositiveReturn ? 'from-emerald-600 via-green-600 to-teal-600' : 'from-rose-600 via-red-600 to-pink-600'} bg-clip-text text-transparent`}>
            {formatPercentage(twr)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">Time-Weighted Return (90d)</div>
        </div>

        {/* Holdings Count */}
        <div className="group bg-gradient-to-br from-white via-fuchsia-50/30 to-purple-50/50 dark:from-gray-800 dark:via-fuchsia-950/20 dark:to-purple-950/30 rounded-xl border border-fuchsia-100 dark:border-fuchsia-900/30 p-6 shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-fuchsia-500/50 transition-shadow duration-300">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
            {holdingsCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">Holdings</div>
        </div>

        {/* Risk Score */}
        <div className="group bg-gradient-to-br from-white via-amber-50/30 to-orange-50/50 dark:from-gray-800 dark:via-amber-950/20 dark:to-orange-950/30 rounded-xl border border-amber-100 dark:border-amber-900/30 p-6 shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-amber-500/50 transition-shadow duration-300">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            {riskScore > 0 ? riskScore.toFixed(1) : 'N/A'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">
            {riskScore > 0 ? getRiskLabel(riskScore) : 'Risk Score'}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mini Performance Chart */}
        <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 dark:from-gray-800 dark:via-blue-950/10 dark:to-indigo-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30 p-6 shadow-lg hover:shadow-glow transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Performance (90 days)</h3>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('performance')}
                className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center"
              >
                View Details
                <ArrowRight className="w-4 h-4 ml-1 text-blue-600 dark:text-blue-400" />
              </button>
            )}
          </div>
          {performanceChartData.length > 0 ? (
            <RechartsResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="#6b7280"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => formatCurrency(value)}
                  stroke="#6b7280"
                />
                <RechartsTooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </RechartsResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-gray-500 dark:text-gray-400">No historical data available</p>
            </div>
          )}
        </div>

        {/* Top Holdings Pie Chart */}
        <div className="bg-gradient-to-br from-white via-purple-50/20 to-fuchsia-50/30 dark:from-gray-800 dark:via-purple-950/10 dark:to-fuchsia-950/20 rounded-xl border border-purple-100 dark:border-purple-900/30 p-6 shadow-lg hover:shadow-glow transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Top 5 Holdings</h3>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('holdings')}
                className="text-sm font-medium bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-200 flex items-center"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1 text-purple-600 dark:text-purple-400" />
              </button>
            )}
          </div>
          {topHoldingsData.length > 0 ? (
            <div className="space-y-3">
              <ResponsiveContainer width="100%" height={180}>
                <RechartsPieChart>
                  <Pie
                    data={topHoldingsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={65}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topHoldingsData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, _name: string, props: any) => [formatCurrency(value), props.payload.name]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      padding: '8px 12px',
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              {/* Custom Legend */}
              <div className="grid grid-cols-1 gap-1.5 text-xs max-h-16 overflow-y-auto px-2">
                {topHoldingsData.map((holding, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-700 dark:text-gray-300 truncate font-medium">{holding.name}</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 ml-2 flex-shrink-0 text-xs">
                      {formatCurrency(holding.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-gray-500 dark:text-gray-400">No holdings data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Risk Indicators */}
      {riskData && (
        <div className="bg-gradient-to-br from-white via-red-50/20 to-orange-50/30 dark:from-gray-800 dark:via-red-950/10 dark:to-orange-950/20 rounded-xl border border-red-100 dark:border-red-900/30 p-6 shadow-lg hover:shadow-glow transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Quick Risk Indicators</h3>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('risk')}
                className="text-sm font-medium bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent hover:from-red-700 hover:to-orange-700 transition-all duration-200 flex items-center"
              >
                Full Risk Analysis
                <ArrowRight className="w-4 h-4 ml-1 text-red-600 dark:text-red-400" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sharpe Ratio</div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {riskData.sharpeRatio.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Risk-adjusted return</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30 rounded-xl p-4 border border-purple-100 dark:border-purple-900/30">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Volatility</div>
              <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                {formatPercentage(riskData.annualizedVolatility)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Annualized</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Max Drawdown</div>
              <div className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                {formatPercentage(riskData.maximumDrawdown)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Worst decline</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      {onNavigateToTab && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 rounded-xl border border-purple-200 dark:border-purple-800/50 p-6 shadow-lg">
          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">Explore More</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={() => onNavigateToTab('performance')}
              className="group bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-950/30 hover:shadow-lg rounded-xl p-3 text-center border border-blue-200 dark:border-blue-900/30 transition-all duration-300 hover:scale-105"
            >
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mx-auto mb-2 w-fit group-hover:shadow-blue-500/50 transition-shadow">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100">Performance</div>
            </button>
            <button
              onClick={() => onNavigateToTab('holdings')}
              className="group bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-950/30 hover:shadow-lg rounded-xl p-3 text-center border border-purple-200 dark:border-purple-900/30 transition-all duration-300 hover:scale-105"
            >
              <div className="p-2 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-lg mx-auto mb-2 w-fit group-hover:shadow-purple-500/50 transition-shadow">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100">Holdings</div>
            </button>
            <button
              onClick={() => onNavigateToTab('contributions')}
              className="group bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-800 dark:to-emerald-950/30 hover:shadow-lg rounded-xl p-3 text-center border border-emerald-200 dark:border-emerald-900/30 transition-all duration-300 hover:scale-105"
            >
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg mx-auto mb-2 w-fit group-hover:shadow-emerald-500/50 transition-shadow">
                <PoundSterling className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100">Contributions</div>
            </button>
            <button
              onClick={() => onNavigateToTab('attribution')}
              className="group bg-gradient-to-br from-white to-amber-50/50 dark:from-gray-800 dark:to-amber-950/30 hover:shadow-lg rounded-xl p-3 text-center border border-amber-200 dark:border-amber-900/30 transition-all duration-300 hover:scale-105"
            >
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg mx-auto mb-2 w-fit group-hover:shadow-amber-500/50 transition-shadow">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100">Attribution</div>
            </button>
            <button
              onClick={() => onNavigateToTab('risk')}
              className="group bg-gradient-to-br from-white to-red-50/50 dark:from-gray-800 dark:to-red-950/30 hover:shadow-lg rounded-xl p-3 text-center border border-red-200 dark:border-red-900/30 transition-all duration-300 hover:scale-105"
            >
              <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg mx-auto mb-2 w-fit group-hover:shadow-red-500/50 transition-shadow">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100">Risk</div>
            </button>
            <button
              onClick={() => onNavigateToTab('advanced')}
              className="group bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-800 dark:to-indigo-950/30 hover:shadow-lg rounded-xl p-3 text-center border border-indigo-200 dark:border-indigo-900/30 transition-all duration-300 hover:scale-105"
            >
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg mx-auto mb-2 w-fit group-hover:shadow-indigo-500/50 transition-shadow">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100">Advanced</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDashboard;
