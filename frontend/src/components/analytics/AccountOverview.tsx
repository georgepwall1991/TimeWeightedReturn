import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, PieChart } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, type PieLabelRenderProps } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { AnalyticsDashboardSkeleton } from '../common/Skeleton';

interface AccountOverviewProps {
  accountId: string;
  accountName: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const AccountOverview: React.FC<AccountOverviewProps> = ({ accountId, accountName }) => {
  // Calculate date range for the overview (last 90 days)
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 90);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }, []);

  // Fetch account data
  const { data: accountData, isLoading: accountLoading, error: accountError } = api.useGetAccountQuery({ accountId });
  const { data: currentHoldings, isLoading: holdingsLoading, error: holdingsError } = api.useGetAccountHoldingsQuery({
    accountId,
    date: dateRange.end,
  });
  const { data: twrData, isLoading: twrLoading, error: twrError } = api.useCalculateTWRQuery({
    accountId,
    from: dateRange.start,
    to: dateRange.end,
  });
  const { data: historyData } = api.useGetAccountHoldingsHistoryQuery({
    accountId,
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  // Calculate asset allocation data
  const allocationData = useMemo(() => {
    if (!currentHoldings?.holdings) return [];

    // Group by instrument type
    const typeMap = new Map<string, number>();
    currentHoldings.holdings.forEach(holding => {
      const type = holding.instrumentType || 'Unknown';
      const current = typeMap.get(type) || 0;
      typeMap.set(type, current + holding.valueGBP);
    });

    return Array.from(typeMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / currentHoldings.totalValueGBP) * 100,
      }))
      .sort((a, b) => b.value - a.value);
  }, [currentHoldings]);

  // Prepare historical value chart data
  const historicalChartData = useMemo(() => {
    if (!historyData?.historicalData) return [];

    return historyData.historicalData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      value: item.totalValueGBP,
    }));
  }, [historyData]);

  // Only require account and holdings data - TWR and history are optional
  const isLoading = accountLoading || holdingsLoading || twrLoading;
  const hasRequiredData = accountData && currentHoldings;
  const isPositiveReturn = twrData && twrData.timeWeightedReturn >= 0;

  if (isLoading) {
    return <AnalyticsDashboardSkeleton />;
  }

  // If critical data failed to load, show error
  if (!hasRequiredData || accountError || holdingsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">Failed to load account data</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {accountError ? 'Could not fetch account details' : 'Could not fetch holdings data'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Value */}
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Current Value</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(currentHoldings.totalValueGBP)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {currentHoldings.count} holdings
          </div>
        </div>

        {/* 90-Day Return */}
        <div className={`bg-linear-to-br ${
          twrData && isPositiveReturn ? 'from-green-50 to-green-100' : twrData && !isPositiveReturn ? 'from-red-50 to-red-100' : 'from-gray-50 to-gray-100'
        } rounded-lg p-4 border ${
          twrData && isPositiveReturn ? 'border-green-200' : twrData && !isPositiveReturn ? 'border-red-200' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${
              twrData && isPositiveReturn ? 'text-green-700' : twrData && !isPositiveReturn ? 'text-red-700' : 'text-gray-700'
            }`}>
              90-Day Return
            </span>
            {twrData ? (
              isPositiveReturn ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )
            ) : (
              <TrendingUp className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className={`text-2xl font-bold ${
            twrData && isPositiveReturn ? 'text-green-900' : twrData && !isPositiveReturn ? 'text-red-900' : 'text-gray-500'
          }`}>
            {twrData ? formatPercentage(twrData.timeWeightedReturn) : 'N/A'}
          </div>
          <div className={`text-xs ${
            twrData && isPositiveReturn ? 'text-green-600' : twrData && !isPositiveReturn ? 'text-red-600' : 'text-gray-500'
          } mt-1`}>
            {twrError ? 'Insufficient data' : `${new Date(dateRange.start).toLocaleDateString('en-GB')} - ${new Date(dateRange.end).toLocaleDateString('en-GB')}`}
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">Account</span>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-lg font-bold text-purple-900 truncate">
            {accountData.accountNumber}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Currency: {accountData.currency}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Asset Allocation</h3>
          </div>
          {allocationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: PieLabelRenderProps) => `${props.name}: ${(props.percentage as number).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No allocation data available
            </div>
          )}
        </div>

        {/* Historical Value Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Value History (90 Days)</h3>
          </div>
          {historicalChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={historicalChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                  tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                />
                <RechartsTooltip
                  formatter={(value: number) => [formatCurrency(value), 'Value']}
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={twrData && isPositiveReturn ? '#10B981' : '#6B7280'}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No historical data available
            </div>
          )}
        </div>
      </div>

      {/* Asset Allocation Breakdown Table */}
      {allocationData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Allocation Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset Type
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocation
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allocationData.map((item, index) => (
                  <tr key={item.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(item.value)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                      {item.percentage.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-linear-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-600">Account Name</div>
            <div className="text-sm font-medium text-gray-900 truncate">{accountName}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Total Holdings</div>
            <div className="text-sm font-medium text-gray-900">{currentHoldings.count}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Asset Classes</div>
            <div className="text-sm font-medium text-gray-900">{allocationData.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Data Status</div>
            <div className="text-sm font-medium text-gray-900">{currentHoldings.dataStatus}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountOverview;
