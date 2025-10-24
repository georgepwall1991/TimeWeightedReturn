import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface HoldingData {
  ticker: string;
  name?: string;
  value: number;
  units: number;
  type: 'Cash' | 'Security';
}

interface HoldingsCompositionChartProps {
  holdings: HoldingData[];
  title?: string;
  height?: number;
  showLegend?: boolean;
}

const COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6B7280', // Gray
];

const HoldingsCompositionChart: React.FC<HoldingsCompositionChartProps> = ({
  holdings,
  title = "Portfolio Composition",
  height = 400,
  showLegend = true
}) => {
  const chartData = useMemo(() => {
    const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);

    return holdings
      .filter(holding => holding.value > 0)
      .map((holding, index) => ({
        name: holding.ticker,
        fullName: holding.name || holding.ticker,
        value: holding.value,
        percentage: holding.value / totalValue,
        units: holding.units,
        type: holding.type,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Show top 10 holdings
  }, [holdings]);

  const totalValue = useMemo(() =>
    holdings.reduce((sum, holding) => sum + holding.value, 0),
    [holdings]
  );

  // Define proper tooltip payload interface
  interface TooltipPayload {
    payload: {
      name: string;
      fullName: string;
      value: number;
      percentage: number;
      units: number;
      type: 'Cash' | 'Security';
      color: string;
    };
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {data.fullName}
          </p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Value:</span> {formatCurrency(data.value)}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Allocation:</span> {formatPercentage(data.percentage)}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Units:</span> {data.units.toLocaleString()}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Type:</span> {data.type}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };



  if (!holdings.length || totalValue === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No holdings data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Value</div>
          <div className="font-semibold text-gray-900">
            {formatCurrency(totalValue)}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={height / 3}
                innerRadius={height / 6}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {showLegend && (
          <div className="lg:w-80 lg:shrink-0">
            <div className="mt-4 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {chartData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2 shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-700 truncate">
                        {item.fullName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <span className="text-gray-500 text-xs">
                        {formatPercentage(item.percentage)}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500">Total Holdings</div>
            <div className="font-semibold text-gray-900">
              {holdings.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Cash Holdings</div>
            <div className="font-semibold text-gray-900">
              {holdings.filter(h => h.type === 'Cash').length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Securities</div>
            <div className="font-semibold text-gray-900">
              {holdings.filter(h => h.type === 'Security').length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Largest Holding</div>
            <div className="font-semibold text-gray-900">
              {chartData.length > 0 ? formatPercentage(chartData[0].percentage) : '0%'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoldingsCompositionChart;
