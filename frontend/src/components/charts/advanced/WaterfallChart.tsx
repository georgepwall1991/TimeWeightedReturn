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
  formatCurrency,
  formatPercent,
} from './chartUtils';

export interface WaterfallDataPoint {
  name: string;
  value: number;
  isTotal?: boolean;
}

interface WaterfallChartProps {
  data: WaterfallDataPoint[];
  title?: string;
  height?: number;
  showExport?: boolean;
  valueType?: 'currency' | 'percentage';
  currency?: string;
}

const WaterfallChart: React.FC<WaterfallChartProps> = ({
  data,
  title = 'Waterfall Analysis',
  height = 400,
  showExport = true,
  valueType = 'currency',
  currency = 'USD',
}) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  const chartRef = useRef<any>(null);
  const theme = getChartTheme(isDark);

  const chartOption: EChartsOption = useMemo(() => {
    // Calculate running totals for waterfall positioning
    let runningTotal = 0;
    const chartData = data.map((item, index) => {
      const isFirst = index === 0;

      if (isFirst || item.isTotal) {
        // Starting value or total - show full bar from zero
        const value = item.value;
        runningTotal = value;
        return {
          name: item.name,
          value: value,
          itemStyle: {
            color: isFirst ? '#3b82f6' : '#8b5cf6',
          },
        };
      } else {
        // Intermediate value - show as increment/decrement
        const startValue = runningTotal;
        runningTotal += item.value;

        return {
          name: item.name,
          value: [startValue, runningTotal],
          itemStyle: {
            color: item.value >= 0 ? '#10b981' : '#ef4444',
          },
        };
      }
    });

    const formatValue = (value: number) => {
      if (valueType === 'percentage') {
        return formatPercent(value);
      }
      return formatCurrency(value, currency);
    };

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
      tooltip: {
        ...getTooltipConfig(isDark),
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params;

          let valueText = '';
          if (Array.isArray(param.value)) {
            const change = param.value[1] - param.value[0];
            valueText = `Change: ${formatValue(change)}<br/>`;
            valueText += `From: ${formatValue(param.value[0])}<br/>`;
            valueText += `To: ${formatValue(param.value[1])}`;
          } else {
            valueText = `Value: ${formatValue(param.value)}`;
          }

          return `<strong>${param.name}</strong><br/>${valueText}`;
        },
      },
      grid: getGridConfig(false),
      xAxis: {
        type: 'category',
        data: data.map(d => d.name),
        axisLine: {
          lineStyle: {
            color: theme.axisLineColor,
          },
        },
        axisLabel: {
          color: theme.textColor,
          rotate: data.length > 8 ? 45 : 0,
          fontSize: 11,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: theme.textColor,
          formatter: (value: number) => formatValue(value),
        },
        splitLine: {
          lineStyle: {
            color: theme.splitLineColor,
          },
        },
      },
      series: [
        {
          type: 'bar',
          data: chartData,
          barWidth: '60%',
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => {
              if (Array.isArray(params.value)) {
                const change = params.value[1] - params.value[0];
                return formatValue(change);
              }
              return formatValue(params.value);
            },
            color: theme.textColor,
            fontSize: 10,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
        },
      ],
    };
  }, [data, title, isDark, theme, valueType, currency]);

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

export default WaterfallChart;
