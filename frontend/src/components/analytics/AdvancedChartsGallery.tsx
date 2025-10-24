import React, { useState, useMemo } from 'react';
import { BarChart3, Maximize2, X } from 'lucide-react';
import {
  WaterfallChart,
  HeatMap,
  SankeyDiagram,
  CandlestickChart,
  BubbleChart,
  RadarChart,
  TreemapChart,
} from '../charts/advanced';
import { api } from '../../services/api';

interface AdvancedChartsGalleryProps {
  accountId: string;
  accountName: string;
}

type ChartType = 'waterfall' | 'heatmap' | 'sankey' | 'candlestick' | 'bubble' | 'radar' | 'treemap';

interface ChartInfo {
  id: ChartType;
  name: string;
  description: string;
  icon: string;
}

const chartDefinitions: ChartInfo[] = [
  {
    id: 'waterfall',
    name: 'Attribution Waterfall',
    description: 'Visualize how different factors contribute to overall performance',
    icon: '📊',
  },
  {
    id: 'radar',
    name: 'Risk Profile Radar',
    description: 'Multi-dimensional view of risk metrics',
    icon: '🎯',
  },
  {
    id: 'treemap',
    name: 'Portfolio Treemap',
    description: 'Hierarchical visualization of holdings allocation',
    icon: '🌳',
  },
  {
    id: 'bubble',
    name: 'Risk vs Return',
    description: 'Compare risk and return characteristics across holdings',
    icon: '🫧',
  },
  {
    id: 'heatmap',
    name: 'Correlation Matrix',
    description: 'Asset correlation heat map',
    icon: '🔥',
  },
  {
    id: 'sankey',
    name: 'Fund Flow Diagram',
    description: 'Visualize movement of funds between categories',
    icon: '🌊',
  },
  {
    id: 'candlestick',
    name: 'Price Chart',
    description: 'OHLC price movements over time',
    icon: '🕯️',
  },
];

const AdvancedChartsGallery: React.FC<AdvancedChartsGalleryProps> = ({
  accountId,
  accountName,
}) => {
  const [selectedChart, setSelectedChart] = useState<ChartType | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  // Fetch data for charts
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 90);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }, []);

  const { data: riskData } = api.useCalculateRiskMetricsQuery({
    accountId,
    startDate: dateRange.start,
    endDate: dateRange.end,
    riskFreeRate: 0.02,
  });

  const { data: currentHoldings } = api.useGetAccountHoldingsQuery({
    accountId,
    date: dateRange.end,
  });

  // Prepare data for charts
  // Sample attribution waterfall data (attribution API not yet implemented)
  const waterfallData = useMemo(() => {
    return [
      { name: 'Benchmark', value: 0, isTotal: true },
      { name: 'Allocation', value: 0.015 },
      { name: 'Selection', value: 0.023 },
      { name: 'Interaction', value: -0.005 },
      { name: 'Portfolio', value: 0.033, isTotal: true },
    ];
  }, []);

  const radarData = useMemo(() => {
    if (!riskData) return null;

    return {
      indicators: [
        { name: 'Returns', max: 100 },
        { name: 'Sharpe', max: 3 },
        { name: 'Stability', max: 100 },
        { name: 'Recovery', max: 100 },
        { name: 'Risk Score', max: 10 },
      ],
      series: [
        {
          name: accountName,
          values: [
            Math.max(0, Math.min(100, (riskData.annualizedReturn + 0.5) * 100)),
            Math.max(0, Math.min(3, riskData.sharpeRatio)),
            Math.max(0, Math.min(100, (1 - riskData.annualizedVolatility) * 100)),
            Math.max(0, Math.min(100, (1 + riskData.maximumDrawdown) * 100)),
            riskData.riskAssessment.riskScore,
          ],
        },
      ],
    };
  }, [riskData, accountName]);

  const treemapData = useMemo(() => {
    if (!currentHoldings?.holdings) return [];

    const typeMap = new Map<string, { value: number; holdings: any[] }>();
    currentHoldings.holdings.forEach(holding => {
      const type = holding.instrumentType || 'Unknown';
      if (!typeMap.has(type)) {
        typeMap.set(type, { value: 0, holdings: [] });
      }
      const group = typeMap.get(type)!;
      group.value += holding.valueGBP;
      group.holdings.push(holding);
    });

    return Array.from(typeMap.entries()).map(([name, data]) => ({
      name,
      value: data.value,
      children: data.holdings.slice(0, 5).map(h => ({
        name: h.name || 'Unknown',
        value: h.valueGBP,
      })),
    }));
  }, [currentHoldings]);

  const bubbleData = useMemo(() => {
    if (!currentHoldings?.holdings) return [];

    return currentHoldings.holdings
      .slice(0, 10)
      .map(holding => ({
        name: holding.name || 'Unknown',
        risk: Math.random() * 0.3,
        return: Math.random() * 0.4 - 0.1,
        size: holding.valueGBP,
        category: holding.instrumentType || 'Unknown',
      }));
  }, [currentHoldings]);

  // Sample data
  const sampleHeatmapData = [
    { x: 0, y: 0, value: 1.0 },
    { x: 0, y: 1, value: 0.7 },
    { x: 0, y: 2, value: 0.3 },
    { x: 1, y: 0, value: 0.7 },
    { x: 1, y: 1, value: 1.0 },
    { x: 1, y: 2, value: 0.5 },
    { x: 2, y: 0, value: 0.3 },
    { x: 2, y: 1, value: 0.5 },
    { x: 2, y: 2, value: 1.0 },
  ];

  const sampleSankeyData = {
    nodes: [
      { name: 'Cash' },
      { name: 'Stocks' },
      { name: 'Bonds' },
      { name: 'US Equities' },
      { name: 'International' },
      { name: 'Gov Bonds' },
      { name: 'Corp Bonds' },
    ],
    links: [
      { source: 'Cash', target: 'Stocks', value: 50000 },
      { source: 'Cash', target: 'Bonds', value: 30000 },
      { source: 'Stocks', target: 'US Equities', value: 30000 },
      { source: 'Stocks', target: 'International', value: 20000 },
      { source: 'Bonds', target: 'Gov Bonds', value: 18000 },
      { source: 'Bonds', target: 'Corp Bonds', value: 12000 },
    ],
  };

  const sampleCandlestickData = Array.from({ length: 30 }, (_, i) => {
    const base = 100 + Math.random() * 20;
    return {
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      open: base + Math.random() * 5,
      high: base + Math.random() * 8,
      low: base - Math.random() * 5,
      close: base + Math.random() * 5,
      volume: Math.floor(Math.random() * 1000000),
    };
  });

  const renderChart = (chartType: ChartType) => {
    switch (chartType) {
      case 'waterfall':
        return waterfallData.length > 0 ? (
          <WaterfallChart
            data={waterfallData}
            title="Attribution Waterfall"
            height={fullscreen ? 600 : 500}
            valueType="percentage"
          />
        ) : (
          <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No attribution data available</p>
          </div>
        );

      case 'radar':
        return radarData ? (
          <RadarChart
            indicators={radarData.indicators}
            series={radarData.series}
            title="Risk Profile Overview"
            height={fullscreen ? 600 : 500}
          />
        ) : (
          <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No risk data available</p>
          </div>
        );

      case 'treemap':
        return treemapData.length > 0 ? (
          <TreemapChart
            data={treemapData}
            title="Holdings Allocation Treemap"
            height={fullscreen ? 600 : 500}
            showPercentages={true}
          />
        ) : (
          <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No holdings data available</p>
          </div>
        );

      case 'bubble':
        return bubbleData.length > 0 ? (
          <BubbleChart
            data={bubbleData}
            title="Risk vs Return Analysis"
            height={fullscreen ? 600 : 500}
            xAxisLabel="Risk (Volatility)"
            yAxisLabel="Return"
          />
        ) : (
          <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No holdings data available</p>
          </div>
        );

      case 'heatmap':
        return (
          <HeatMap
            data={sampleHeatmapData}
            xLabels={['Asset A', 'Asset B', 'Asset C']}
            yLabels={['Asset A', 'Asset B', 'Asset C']}
            title="Asset Correlation Matrix"
            height={fullscreen ? 600 : 500}
          />
        );

      case 'sankey':
        return (
          <SankeyDiagram
            nodes={sampleSankeyData.nodes}
            links={sampleSankeyData.links}
            title="Fund Flow Diagram"
            height={fullscreen ? 600 : 500}
          />
        );

      case 'candlestick':
        return (
          <CandlestickChart
            data={sampleCandlestickData}
            title="Price Movement"
            height={fullscreen ? 600 : 500}
            showVolume={true}
          />
        );

      default:
        return null;
    }
  };

  if (fullscreen && selectedChart) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {chartDefinitions.find(c => c.id === selectedChart)?.name}
            </h2>
            <button
              onClick={() => setFullscreen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-6">
          {renderChart(selectedChart)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Advanced Visualizations
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Explore your portfolio data through advanced interactive charts
            </p>
          </div>
          <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>

      {/* Chart Gallery */}
      {!selectedChart ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chartDefinitions.map((chart) => (
            <button
              key={chart.id}
              onClick={() => setSelectedChart(chart.id)}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-lg transition-all text-left group"
            >
              <div className="text-4xl mb-3">{chart.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {chart.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{chart.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div>
          {/* Chart Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedChart(null)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Gallery
            </button>
            <button
              onClick={() => setFullscreen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="text-sm">Fullscreen</span>
            </button>
          </div>

          {/* Selected Chart */}
          {renderChart(selectedChart)}
        </div>
      )}
    </div>
  );
};

export default AdvancedChartsGallery;
