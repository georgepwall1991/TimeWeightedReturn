import React, { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useTheme } from '../../../contexts/ThemeContext';
import { Download } from 'lucide-react';
import {
  getChartTheme,
  getTooltipConfig,
  getAnimationConfig,
  exportChartAsPNG,
  exportChartAsSVG,
} from './chartUtils';

export interface HeatMapDataPoint {
  x: number; // index for x-axis
  y: number; // index for y-axis
  value: number; // correlation value
}

interface HeatMapProps {
  data: HeatMapDataPoint[];
  xLabels: string[];
  yLabels: string[];
  title?: string;
  height?: number;
  showExport?: boolean;
  minValue?: number;
  maxValue?: number;
  colorRange?: [string, string, string]; // [negative, neutral, positive]
}

const HeatMap: React.FC<HeatMapProps> = ({
  data,
  xLabels,
  yLabels,
  title = 'Correlation Heat Map',
  height = 500,
  showExport = true,
  minValue = -1,
  maxValue = 1,
  colorRange = ['#ef4444', '#f3f4f6', '#10b981'],
}) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  const chartRef = useRef<any>(null);
  const theme = getChartTheme(isDark);

  const chartOption: EChartsOption = useMemo(() => {
    // Transform data for ECharts format: [x, y, value]
    const chartData = data.map(point => [point.x, point.y, point.value]);

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
        position: 'top',
        formatter: (params: any) => {
          const [x, y, value] = params.value;
          return `<strong>${yLabels[y]} vs ${xLabels[x]}</strong><br/>Correlation: ${value.toFixed(3)}`;
        },
      },
      grid: {
        left: '15%',
        right: '10%',
        top: '15%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xLabels,
        splitArea: {
          show: true,
        },
        axisLabel: {
          color: theme.textColor,
          rotate: xLabels.length > 8 ? 45 : 0,
          fontSize: 11,
        },
        axisLine: {
          lineStyle: {
            color: theme.axisLineColor,
          },
        },
      },
      yAxis: {
        type: 'category',
        data: yLabels,
        splitArea: {
          show: true,
        },
        axisLabel: {
          color: theme.textColor,
          fontSize: 11,
        },
        axisLine: {
          lineStyle: {
            color: theme.axisLineColor,
          },
        },
      },
      visualMap: {
        min: minValue,
        max: maxValue,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '2%',
        inRange: {
          color: isDark
            ? ['#7f1d1d', '#991b1b', '#dc2626', '#f87171', '#6b7280', '#34d399', '#10b981', '#059669', '#047857']
            : colorRange.length === 3
              ? [colorRange[0], colorRange[1], colorRange[2]]
              : ['#ef4444', '#fbbf24', '#f3f4f6', '#86efac', '#10b981'],
        },
        textStyle: {
          color: theme.textColor,
        },
      },
      series: [
        {
          name: 'Correlation',
          type: 'heatmap',
          data: chartData,
          label: {
            show: data.length < 100, // Only show labels if not too many cells
            color: theme.textColor,
            fontSize: 10,
            formatter: (params: any) => params.value[2].toFixed(2),
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }, [data, xLabels, yLabels, title, isDark, theme, minValue, maxValue, colorRange]);

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

export default HeatMap;
