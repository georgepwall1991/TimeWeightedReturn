import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import type { HoldingDto } from '../../types/api';

interface HoldingsComparisonChartProps {
  baseData?: HoldingDto[];
  compareData?: HoldingDto[];
  baseDate: string;
  compareDate: string;
}

export const HoldingsComparisonChart: React.FC<HoldingsComparisonChartProps> = ({
  baseData = [],
  compareData = [],
  baseDate,
  compareDate,
}) => {
  if (!baseData.length || !compareData.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No comparison data available
      </div>
    );
  }

  // Create a map of holdings by instrument ID for easy lookup
  const baseHoldingsMap = new Map(baseData.map(h => [h.instrumentId, h]));
  const compareHoldingsMap = new Map(compareData.map(h => [h.instrumentId, h]));

  // Get all unique instrument IDs
  const allInstrumentIds = new Set([
    ...baseData.map(h => h.instrumentId),
    ...compareData.map(h => h.instrumentId)
  ]);

  // Calculate comparison data
  const comparisonData = Array.from(allInstrumentIds).map(instrumentId => {
    const baseHolding = baseHoldingsMap.get(instrumentId);
    const compareHolding = compareHoldingsMap.get(instrumentId);

    const baseValue = baseHolding?.valueGBP ?? 0;
    const compareValue = compareHolding?.valueGBP ?? 0;
    const valueChange = compareValue - baseValue;
    const percentChange = baseValue !== 0 ? (valueChange / baseValue) * 100 : 0;

    return {
      name: baseHolding?.name ?? compareHolding?.name ?? 'Unknown',
      ticker: baseHolding?.ticker ?? compareHolding?.ticker ?? 'UNKNOWN',
      baseValue,
      compareValue,
      valueChange,
      percentChange
    };
  }).sort((a, b) => Math.abs(b.valueChange) - Math.abs(a.valueChange))
    .slice(0, 10); // Show top 10 changes

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={comparisonData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="ticker"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'baseValue') return [formatCurrency(value), `${new Date(baseDate).toLocaleDateString()} Value`];
              if (name === 'compareValue') return [formatCurrency(value), `${new Date(compareDate).toLocaleDateString()} Value`];
              if (name === 'valueChange') return [formatCurrency(value), 'Value Change'];
              if (name === 'percentChange') return [`${value.toFixed(2)}%`, 'Percent Change'];
              return [value, name];
            }}
            labelFormatter={(label) => `${label} - ${comparisonData.find(d => d.ticker === label)?.name}`}
          />
          <Legend />
          <Bar
            dataKey="baseValue"
            name={`${new Date(baseDate).toLocaleDateString()} Value`}
            fill="#94a3b8"
            opacity={0.7}
          />
          <Bar
            dataKey="compareValue"
            name={`${new Date(compareDate).toLocaleDateString()} Value`}
            fill="#2563eb"
            opacity={0.7}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
