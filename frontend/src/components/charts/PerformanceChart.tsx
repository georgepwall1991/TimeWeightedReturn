import React, { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface PerformanceDataPoint {
  date: string;
  value: number;
  return?: number;
}

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
  title?: string;
  height?: number;
  showReturns?: boolean;
  color?: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  title = "Portfolio Performance",
  height = 300,
  showReturns = false,
  color = "#3B82F6"
}) => {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      dateFormatted: new Date(point.date).toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric'
      }),
      returnPercent: point.return ? point.return * 100 : undefined
    }));
  }, [data]);

  const minValue = useMemo(() => Math.min(...data.map(d => d.value)), [data]);
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
  const valueRange = maxValue - minValue;
  const padding = valueRange * 0.1;

  // Define proper tooltip payload interface
  interface TooltipPayload {
    payload: PerformanceDataPoint & {
      dateFormatted: string;
      returnPercent?: number;
    };
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {new Date(data.date).toLocaleDateString('en-GB', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Value:</span> {formatCurrency(data.value)}
          </p>
          {showReturns && data.return && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Return:</span> {formatPercentage(data.return)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (!data.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No performance data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: color }}
            />
            <span className="text-gray-600">Portfolio Value</span>
          </div>
          {data.length > 0 && (
            <div className="text-right">
              <div className="text-gray-500">Current</div>
              <div className="font-semibold text-gray-900">
                {formatCurrency(data[data.length - 1].value)}
              </div>
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id={`gradient-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="dateFormatted"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (value >= 1000000) return `£${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `£${(value / 1000).toFixed(0)}K`;
              return formatCurrency(value);
            }}
            domain={[
              Math.max(0, minValue - padding),
              maxValue + padding
            ]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color.slice(1)})`}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: color, strokeWidth: 2, stroke: 'white' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {data.length > 1 && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500">Period Start</div>
            <div className="font-semibold text-gray-900">
              {formatCurrency(data[0].value)}
            </div>
            <div className="text-xs text-gray-400">
              {new Date(data[0].date).toLocaleDateString('en-GB')}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Return</div>
            <div className={`font-semibold ${
              data[data.length - 1].value >= data[0].value
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {formatPercentage((data[data.length - 1].value - data[0].value) / data[0].value)}
            </div>
            <div className="text-xs text-gray-400">
              {formatCurrency(data[data.length - 1].value - data[0].value)} absolute
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Period End</div>
            <div className="font-semibold text-gray-900">
              {formatCurrency(data[data.length - 1].value)}
            </div>
            <div className="text-xs text-gray-400">
              {new Date(data[data.length - 1].date).toLocaleDateString('en-GB')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceChart;
