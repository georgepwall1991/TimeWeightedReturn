import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface HoldingsPerformanceChartProps {
  data?: {
    date: string;
    totalValue: number;
    performance: number;
  }[];
}

export const HoldingsPerformanceChart: React.FC<HoldingsPerformanceChartProps> = ({ data = [] }) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No performance data available
      </div>
    );
  }

  // Calculate cumulative performance
  const chartData = data.map((point, index) => {
    const cumulativePerformance = index === 0 ? 0 :
      ((point.totalValue / data[0].totalValue) - 1) * 100;

    return {
      date: new Date(point.date).toLocaleDateString(),
      value: point.totalValue,
      performance: point.performance,
      cumulativePerformance
    };
  });

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.split('/').slice(0, 2).join('/')}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => `${value.toFixed(1)}%`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'value') return [formatCurrency(value), 'Portfolio Value'];
              if (name === 'performance') return [formatPercentage(value), 'Daily Return'];
              if (name === 'cumulativePerformance') return [`${value.toFixed(2)}%`, 'Cumulative Return'];
              return [value, name];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="value"
            name="Portfolio Value"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulativePerformance"
            name="Cumulative Return"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
