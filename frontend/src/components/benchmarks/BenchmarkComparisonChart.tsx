import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useCompareToBenchmarkQuery } from '../../services/api';

interface BenchmarkComparisonChartProps {
  accountId: string;
  benchmarkId: string;
  startDate: string;
  endDate: string;
}

export const BenchmarkComparisonChart: React.FC<BenchmarkComparisonChartProps> = ({
  accountId,
  benchmarkId,
  startDate,
  endDate,
}) => {
  const { data, isLoading, error } = useCompareToBenchmarkQuery({
    accountId,
    benchmarkId,
    startDate,
    endDate,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-sm font-medium text-red-800">Failed to load benchmark comparison</h3>
        <p className="text-sm text-red-600 mt-1">
          {'data' in error && error.data
            ? JSON.stringify(error.data)
            : 'An error occurred while loading the comparison data'}
        </p>
      </div>
    );
  }

  if (!data || !data.dailyComparisons || data.dailyComparisons.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">No comparison data available for the selected period.</p>
      </div>
    );
  }

  // Format data for the chart
  const chartData = data.dailyComparisons.map((day) => ({
    date: day.date,
    Portfolio: (day.portfolioCumulativeReturn * 100).toFixed(2),
    Benchmark: (day.benchmarkCumulativeReturn * 100).toFixed(2),
  }));

  // Format percentages for display
  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

  return (
    <div className="space-y-4">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Portfolio Return</h4>
          <p className={`text-2xl font-bold mt-1 ${data.portfolioReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(data.portfolioReturn)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Benchmark Return</h4>
          <p className={`text-2xl font-bold mt-1 ${data.benchmarkReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(data.benchmarkReturn)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Active Return</h4>
          <p className={`text-2xl font-bold mt-1 ${data.activeReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(data.activeReturn)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.activeReturn >= 0 ? 'Outperforming' : 'Underperforming'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Tracking Error</h4>
          <p className="text-2xl font-bold mt-1 text-gray-700">
            {formatPercent(data.trackingError)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Volatility of excess returns</p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">
          Cumulative Performance Comparison
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {data.accountName} vs {data.benchmarkName}
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
              label={{ value: 'Cumulative Return (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: number) => `${value}%`}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString();
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Portfolio"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              name={data.accountName}
            />
            <Line
              type="monotone"
              dataKey="Benchmark"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
              name={data.benchmarkName}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Information */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">About This Comparison</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            <strong>Active Return:</strong> The difference between portfolio and benchmark returns.
            Positive values indicate outperformance.
          </li>
          <li>
            <strong>Tracking Error:</strong> Measures how closely the portfolio follows the benchmark.
            Lower values indicate closer tracking.
          </li>
          <li>
            <strong>Period:</strong> {data.startDate} to {data.endDate}
          </li>
        </ul>
      </div>
    </div>
  );
};
