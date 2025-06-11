import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatPercentage, formatCurrency } from '../../utils/formatters';

interface ContributionData {
  ticker: string;
  name: string;
  contribution: number;
  absoluteContribution: number;
  weight: number;
  instrumentReturn: number;
  type: 'Cash' | 'Security';
}

interface ContributionChartProps {
  data: ContributionData[];
  title?: string;
  height?: number;
  showTop?: number;
}

const ContributionChart: React.FC<ContributionChartProps> = ({
  data,
  title = "Performance Contribution Analysis",
  height = 400,
  showTop = 10
}) => {
  const chartData = useMemo(() => {
    // Sort by absolute contribution value and take top contributors
    const sortedData = [...data]
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, showTop);

    return sortedData.map(item => ({
      name: item.ticker,
      fullName: item.name,
      contribution: item.contribution * 100, // Convert to percentage
      absoluteContribution: item.absoluteContribution,
      weight: item.weight * 100,
      instrumentReturn: item.instrumentReturn * 100,
      type: item.type,
      isPositive: item.contribution >= 0
    }));
  }, [data, showTop]);

  const { totalPositive, totalNegative, netContribution } = useMemo(() => {
    const positive = data.filter(d => d.contribution > 0).reduce((sum, d) => sum + d.contribution, 0);
    const negative = data.filter(d => d.contribution < 0).reduce((sum, d) => sum + d.contribution, 0);
    return {
      totalPositive: positive,
      totalNegative: negative,
      netContribution: positive + negative
    };
  }, [data]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{data.fullName}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Contribution:</span>
              <span className={`font-medium ${data.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(data.contribution / 100)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Absolute:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(data.absoluteContribution)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Weight:</span>
              <span className="text-gray-700">{formatPercentage(data.weight / 100)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Return:</span>
              <span className={`${data.instrumentReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(data.instrumentReturn / 100)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Type:</span>
              <span className="text-gray-700">{data.type}</span>
            </div>
          </div>
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
          <p className="text-gray-500">No contribution data available</p>
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
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Positive Contributors</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Negative Contributors</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value.toFixed(2)}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="contribution" radius={[2, 2, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isPositive ? "#10B981" : "#EF4444"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Positive Contributors</div>
            <div className="text-lg font-semibold text-green-600">
              {formatPercentage(totalPositive)}
            </div>
            <div className="text-xs text-gray-400">
              {data.filter(d => d.contribution > 0).length} instruments
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Negative Contributors</div>
            <div className="text-lg font-semibold text-red-600">
              {formatPercentage(totalNegative)}
            </div>
            <div className="text-xs text-gray-400">
              {data.filter(d => d.contribution < 0).length} instruments
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Net Contribution</div>
            <div className={`text-lg font-semibold ${
              netContribution >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(netContribution)}
            </div>
            <div className="text-xs text-gray-400">
              Total portfolio effect
            </div>
          </div>
        </div>
      </div>

      {/* Top Contributors Table */}
      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Top Contributors</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Instrument</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Weight</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Return</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {chartData.slice(0, 5).map((item) => (
                <tr key={item.name} className="hover:bg-gray-50">
                  <td className="py-2 text-sm">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        item.type === 'Security' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-2 text-sm text-right text-gray-700">
                    {formatPercentage(item.weight / 100)}
                  </td>
                  <td className={`py-2 text-sm text-right ${
                    item.instrumentReturn >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(item.instrumentReturn / 100)}
                  </td>
                  <td className={`py-2 text-sm text-right font-medium ${
                    item.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(item.contribution / 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContributionChart;
