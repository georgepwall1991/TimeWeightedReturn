import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface PerformanceDataPoint {
  date: string;
  value: number;
  cumulative_return: number;
}

interface SimplePerformanceChartProps {
  data: PerformanceDataPoint[];
  title: string;
  accountName?: string;
  height?: number;
}

const SimplePerformanceChart: React.FC<SimplePerformanceChartProps> = ({
  data,
  title,
  accountName = "Portfolio",
  height = 300,
}) => {
  // Calculate chart data and scaling
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;

    // Add 10% padding to top and bottom
    const padding = valueRange * 0.1;
    const chartMin = minValue - padding;
    const chartMax = maxValue + padding;
    const chartRange = chartMax - chartMin;

    const width = 800;
    const chartHeight = height - 40; // Leave space for axis labels

    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = chartHeight - ((point.value - chartMin) / chartRange) * chartHeight;
      return { x, y, ...point };
    });

    // Create SVG path
    const pathData = points.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x} ${point.y}`;
    }, '');

    // Create area path for fill
    const areaPath = `${pathData} L ${width} ${chartHeight} L 0 ${chartHeight} Z`;

    return {
      points,
      pathData,
      areaPath,
      width,
      chartHeight,
      minValue: chartMin,
      maxValue: chartMax,
      actualMin: minValue,
      actualMax: maxValue,
    };
  }, [data, height]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (data.length === 0) return null;

    const startValue = data[0].value;
    const endValue = data[data.length - 1].value;
    const totalReturn = (endValue - startValue) / startValue;
    const highestValue = Math.max(...data.map(d => d.value));
    const lowestValue = Math.min(...data.map(d => d.value));

    return {
      startValue,
      endValue,
      totalReturn,
      highestValue,
      lowestValue,
      isPositive: totalReturn >= 0,
    };
  }, [data]);

  if (!summary || !chartData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No performance data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {data.length} data points • {accountName}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.endValue)}
            </div>
            <div className={`flex items-center text-sm font-medium ${
              summary.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {summary.isPositive ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {formatPercentage(summary.totalReturn)}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 uppercase tracking-wide">Start Value</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatCurrency(summary.startValue)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 uppercase tracking-wide">High</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatCurrency(summary.highestValue)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 uppercase tracking-wide">Low</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatCurrency(summary.lowestValue)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 uppercase tracking-wide">Total Return</div>
          <div className={`text-lg font-semibold ${
            summary.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPercentage(summary.totalReturn)}
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${chartData.width} ${height}`}
          className="overflow-visible"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="80" height="40" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height={chartData.chartHeight} fill="url(#grid)" opacity="0.5" />

          {/* Chart area fill */}
          <path
            d={chartData.areaPath}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="none"
          />

          {/* Chart line */}
          <path
            d={chartData.pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {chartData.points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth="2"
                className="hover:r-6 transition-all duration-200 cursor-pointer"
              />
              {/* Tooltip on hover */}
              <title>
                {new Date(point.date).toLocaleDateString('en-GB')}: {formatCurrency(point.value)} ({formatPercentage(point.cumulative_return)})
              </title>
            </g>
          ))}

          {/* Y-axis labels */}
          <text x="-10" y="15" textAnchor="end" className="text-xs fill-gray-600">
            {formatCurrency(chartData.actualMax)}
          </text>
          <text x="-10" y={chartData.chartHeight + 5} textAnchor="end" className="text-xs fill-gray-600">
            {formatCurrency(chartData.actualMin)}
          </text>
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>{new Date(data[0].date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</span>
          <span>{new Date(data[data.length - 1].date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
};

export default SimplePerformanceChart;
