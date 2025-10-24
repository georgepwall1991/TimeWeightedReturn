import React, { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useTheme } from '../../../contexts/ThemeContext';
import { Download } from 'lucide-react';
import {
  getChartTheme,
  getGridConfig,
  getTooltipConfig,
  getAnimationConfig,
  exportChartAsPNG,
  exportChartAsSVG,
  formatPercent,
  formatCurrency,
  chartColors,
} from './chartUtils';

export interface BubbleDataPoint {
  name: string;
  risk: number; // x-axis
  return: number; // y-axis
  size: number; // bubble size (e.g., portfolio value)
  category?: string; // for grouping/coloring
}

interface BubbleChartProps {
  data: BubbleDataPoint[];
  title?: string;
  height?: number;
  showExport?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  currency?: string;
}

const BubbleChart: React.FC<BubbleChartProps> = ({
  data,
  title = 'Risk vs Return Analysis',
  height = 500,
  showExport = true,
  xAxisLabel = 'Risk (Volatility)',
  yAxisLabel = 'Return',
  currency = 'USD',
}) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  const chartRef = useRef<any>(null);
  const theme = getChartTheme(isDark);

  const chartOption: EChartsOption = useMemo(() => {
    // Group data by category
    const categories = [...new Set(data.map(d => d.category || 'Default'))];
    const seriesData = categories.map((category, index) => {
      const categoryData = data.filter(d => (d.category || 'Default') === category);

      return {
        name: category,
        type: 'scatter' as const,
        symbolSize: (dataItem: number[]) => {
          // dataItem[2] is the size value
          const maxSize = Math.max(...data.map(d => d.size));
          const minSize = Math.min(...data.map(d => d.size));
          const normalized = (dataItem[2] - minSize) / (maxSize - minSize || 1);
          return 20 + normalized * 60; // Size range: 20-80
        },
        data: categoryData.map(d => [d.risk, d.return, d.size, d.name]),
        itemStyle: {
          color: chartColors.primary[index % chartColors.primary.length],
          opacity: 0.7,
        },
        emphasis: {
          focus: 'series' as const,
          itemStyle: {
            opacity: 1,
            borderWidth: 2,
            borderColor: '#fff',
          },
        },
      };
    });

    return {
      ...getAnimationConfig(),
      backgroundColor: theme.backgroundColor,
      title: {
        text: title,
        left: 'center',
        textStyle: {
          color: theme.textColor,
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      legend: {
        top: '5%',
        textStyle: {
          color: theme.textColor,
        },
      },
      tooltip: {
        ...getTooltipConfig(isDark),
        trigger: 'item',
        formatter: (params: any) => {
          const [risk, ret, size, name] = params.data;
          return `<strong>${name}</strong><br/>
            ${xAxisLabel}: ${formatPercent(risk)}<br/>
            ${yAxisLabel}: ${formatPercent(ret)}<br/>
            Size: ${formatCurrency(size, currency)}`;
        },
      },
      grid: {
        ...getGridConfig(true),
        top: '15%',
      },
      xAxis: {
        type: 'value',
        name: xAxisLabel,
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          color: theme.textColor,
          fontSize: 12,
        },
        axisLabel: {
          color: theme.textColor,
          formatter: (value: number) => formatPercent(value),
        },
        axisLine: {
          lineStyle: {
            color: theme.axisLineColor,
          },
        },
        splitLine: {
          lineStyle: {
            color: theme.splitLineColor,
          },
        },
      },
      yAxis: {
        type: 'value',
        name: yAxisLabel,
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          color: theme.textColor,
          fontSize: 12,
        },
        axisLabel: {
          color: theme.textColor,
          formatter: (value: number) => formatPercent(value),
        },
        axisLine: {
          lineStyle: {
            color: theme.axisLineColor,
          },
        },
        splitLine: {
          lineStyle: {
            color: theme.splitLineColor,
          },
        },
      },
      series: seriesData,
    };
  }, [data, title, isDark, theme, xAxisLabel, yAxisLabel, currency]);

  const handleExportPNG = () => {
    if (chartRef.current) {
      const chartInstance = chartRef.current.getEchartsInstance();
      exportChartAsPNG(chartInstance, `${title.replace(/\s+/g, '_').toLowerCase()}`);
    }
  };

  const handleExportSVG = () => {
    if (chartRef.current) {
      const chartInstance = chartRef.current.getEchartsInstance();
      exportChartAsSVG(chartInstance, `${title.replace(/\s+/g, '_').toLowerCase()}`);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {showExport && (
        <div className="flex justify-end mb-2 gap-2">
          <button
            onClick={handleExportPNG}
            className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded flex items-center gap-1"
            title="Export as PNG"
          >
            <Download size={14} />
            PNG
          </button>
          <button
            onClick={handleExportSVG}
            className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded flex items-center gap-1"
            title="Export as SVG"
          >
            <Download size={14} />
            SVG
          </button>
        </div>
      )}
      <ReactECharts
        ref={chartRef}
        option={chartOption}
        style={{ height: `${height}px`, width: '100%' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
};

export default BubbleChart;
