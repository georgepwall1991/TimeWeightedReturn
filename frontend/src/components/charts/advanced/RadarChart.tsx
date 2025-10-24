import React, { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useTheme } from '../../../contexts/ThemeContext';
import { Download } from 'lucide-react';
import {
  getChartTheme,
  getAnimationConfig,
  exportChartAsPNG,
  exportChartAsSVG,
  chartColors,
} from './chartUtils';

export interface RadarIndicator {
  name: string;
  max: number;
  min?: number;
}

export interface RadarDataSeries {
  name: string;
  values: number[];
}

interface RadarChartProps {
  indicators: RadarIndicator[];
  series: RadarDataSeries[];
  title?: string;
  height?: number;
  showExport?: boolean;
}

const RadarChart: React.FC<RadarChartProps> = ({
  indicators,
  series,
  title = 'Multi-Metric Comparison',
  height = 500,
  showExport = true,
}) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  const chartRef = useRef<any>(null);
  const theme = getChartTheme(isDark);

  const chartOption: EChartsOption = useMemo(() => {
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
        top: '8%',
        textStyle: {
          color: theme.textColor,
        },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        textStyle: {
          color: theme.textColor,
        },
        formatter: (params: any) => {
          const values = params.value;
          let html = `<strong>${params.name}</strong><br/>`;
          indicators.forEach((indicator, index) => {
            html += `${indicator.name}: ${values[index]}<br/>`;
          });
          return html;
        },
      },
      radar: {
        indicator: indicators.map(ind => ({
          name: ind.name,
          max: ind.max,
          min: ind.min || 0,
        })),
        center: ['50%', '55%'],
        radius: '60%',
        axisName: {
          color: theme.textColor,
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            color: theme.splitLineColor,
          },
        },
        splitArea: {
          areaStyle: {
            color: isDark
              ? ['rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.1)']
              : ['rgba(255, 255, 255, 0.5)', 'rgba(200, 200, 200, 0.1)'],
          },
        },
        axisLine: {
          lineStyle: {
            color: theme.axisLineColor,
          },
        },
      },
      series: [
        {
          type: 'radar',
          data: series.map((s, index) => ({
            name: s.name,
            value: s.values,
            itemStyle: {
              color: chartColors.primary[index % chartColors.primary.length],
            },
            areaStyle: {
              opacity: 0.2,
            },
            lineStyle: {
              width: 2,
            },
            emphasis: {
              areaStyle: {
                opacity: 0.4,
              },
              lineStyle: {
                width: 3,
              },
            },
          })),
        },
      ],
    };
  }, [indicators, series, title, isDark, theme]);

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

  if (!indicators || indicators.length === 0 || !series || series.length === 0) {
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

export default RadarChart;
