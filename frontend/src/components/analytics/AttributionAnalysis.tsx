import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Target, BarChart3, PieChart, Info, Calculator } from 'lucide-react';
import { formatPercentage } from '../../utils/formatters';

interface AttributionData {
  sector: string;
  portfolioWeight: number;
  benchmarkWeight: number;
  portfolioReturn: number;
  benchmarkReturn: number;
  allocationEffect: number;
  selectionEffect: number;
  interactionEffect: number;
  totalEffect: number;
}

interface AttributionAnalysisProps {
  data: AttributionData[];
  accountName: string;
  benchmarkName?: string;
  period: string;
}

const AttributionAnalysis: React.FC<AttributionAnalysisProps> = ({
  data,
  accountName,
  benchmarkName = "Benchmark",
  period,
}) => {
  const [selectedEffect, setSelectedEffect] = useState<'allocation' | 'selection' | 'interaction' | 'total'>('total');
  const [sortBy, setSortBy] = useState<'sector' | 'allocation' | 'selection' | 'total'>('total');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Calculate totals and sort data
  const { sortedData, totals } = useMemo(() => {
    const totals = {
      allocationEffect: data.reduce((sum, item) => sum + item.allocationEffect, 0),
      selectionEffect: data.reduce((sum, item) => sum + item.selectionEffect, 0),
      interactionEffect: data.reduce((sum, item) => sum + item.interactionEffect, 0),
      totalEffect: data.reduce((sum, item) => sum + item.totalEffect, 0),
      portfolioWeight: data.reduce((sum, item) => sum + item.portfolioWeight, 0),
      benchmarkWeight: data.reduce((sum, item) => sum + item.benchmarkWeight, 0),
    };

    const sorted = [...data].sort((a, b) => {
      const aValue = sortBy === 'sector' ? a.sector : a[sortBy + 'Effect' as keyof AttributionData] as number;
      const bValue = sortBy === 'sector' ? b.sector : b[sortBy + 'Effect' as keyof AttributionData] as number;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const numA = typeof aValue === 'number' ? aValue : 0;
      const numB = typeof bValue === 'number' ? bValue : 0;

      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });

    return { sortedData: sorted, totals };
  }, [data, sortBy, sortDirection]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const getEffectValue = (item: AttributionData, effect: typeof selectedEffect) => {
    switch (effect) {
      case 'allocation': return item.allocationEffect;
      case 'selection': return item.selectionEffect;
      case 'interaction': return item.interactionEffect;
      case 'total': return item.totalEffect;
    }
  };



  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <PieChart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No attribution data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Attribution Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">
              {accountName} vs {benchmarkName} • {period}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Brinson-Fachler Model</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-600 uppercase tracking-wide font-medium">Allocation</div>
                <div className={`text-lg font-bold ${
                  totals.allocationEffect >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(totals.allocationEffect)}
                </div>
              </div>
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-xs text-gray-600 mt-1">Sector allocation impact</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-purple-600 uppercase tracking-wide font-medium">Selection</div>
                <div className={`text-lg font-bold ${
                  totals.selectionEffect >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(totals.selectionEffect)}
                </div>
              </div>
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-xs text-gray-600 mt-1">Security selection impact</div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-orange-600 uppercase tracking-wide font-medium">Interaction</div>
                <div className={`text-lg font-bold ${
                  totals.interactionEffect >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(totals.interactionEffect)}
                </div>
              </div>
              <Info className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-xs text-gray-600 mt-1">Combined effect</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Total</div>
                <div className={`text-lg font-bold ${
                  totals.totalEffect >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(totals.totalEffect)}
                </div>
              </div>
              {totals.totalEffect >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className="text-xs text-gray-600 mt-1">Overall attribution</div>
          </div>
        </div>

        {/* Effect Selection */}
        <div className="flex space-x-2 mb-4">
          {(['allocation', 'selection', 'interaction', 'total'] as const).map((effect) => (
            <button
              key={effect}
              onClick={() => setSelectedEffect(effect)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedEffect === effect
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {effect.charAt(0).toUpperCase() + effect.slice(1)} Effect
            </button>
          ))}
        </div>
      </div>

      {/* Attribution Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort('sector')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Sector</span>
                    {sortBy === 'sector' && (
                      <span className="text-blue-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weights
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Returns
                </th>
                <th
                  onClick={() => handleSort('allocation')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Allocation</span>
                    {sortBy === 'allocation' && (
                      <span className="text-blue-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('selection')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Selection</span>
                    {sortBy === 'selection' && (
                      <span className="text-blue-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interaction
                </th>
                <th
                  onClick={() => handleSort('total')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Total</span>
                    {sortBy === 'total' && (
                      <span className="text-blue-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visual
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((item, index) => {
                const effectValue = getEffectValue(item, selectedEffect);
                const maxAbsEffect = Math.max(...data.map(d => Math.abs(getEffectValue(d, selectedEffect))));
                const barWidth = maxAbsEffect > 0 ? Math.abs(effectValue / maxAbsEffect) * 100 : 0;

                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.sector}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatPercentage(item.portfolioWeight)} / {formatPercentage(item.benchmarkWeight)}
                      </div>
                      <div className="text-xs text-gray-500">Portfolio / Benchmark</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatPercentage(item.portfolioReturn)} / {formatPercentage(item.benchmarkReturn)}
                      </div>
                      <div className="text-xs text-gray-500">Portfolio / Benchmark</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        item.allocationEffect >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(item.allocationEffect)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        item.selectionEffect >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(item.selectionEffect)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        item.interactionEffect >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(item.interactionEffect)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${
                        item.totalEffect >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(item.totalEffect)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              effectValue >= 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{
                              width: `${barWidth}%`,
                              marginLeft: effectValue < 0 ? `${100 - barWidth}%` : '0%',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-3 text-sm font-bold text-gray-900">Total</td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900">
                  {formatPercentage(totals.portfolioWeight)} / {formatPercentage(totals.benchmarkWeight)}
                </td>
                <td className="px-6 py-3"></td>
                <td className={`px-6 py-3 text-sm font-bold ${
                  totals.allocationEffect >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(totals.allocationEffect)}
                </td>
                <td className={`px-6 py-3 text-sm font-bold ${
                  totals.selectionEffect >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(totals.selectionEffect)}
                </td>
                <td className={`px-6 py-3 text-sm font-bold ${
                  totals.interactionEffect >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(totals.interactionEffect)}
                </td>
                <td className={`px-6 py-3 text-sm font-bold ${
                  totals.totalEffect >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(totals.totalEffect)}
                </td>
                <td className="px-6 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Methodology Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Brinson-Fachler Attribution Model</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Allocation Effect:</strong> (Portfolio Weight - Benchmark Weight) × Benchmark Return</p>
              <p><strong>Selection Effect:</strong> Benchmark Weight × (Portfolio Return - Benchmark Return)</p>
              <p><strong>Interaction Effect:</strong> (Portfolio Weight - Benchmark Weight) × (Portfolio Return - Benchmark Return)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttributionAnalysis;
