import React, { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useTheme } from '../../../contexts/ThemeContext';
import { Download } from 'lucide-react';
import {
  getChartTheme,
  getAnimationConfig,
  getDataZoomConfig,
  exportChartAsPNG,
  exportChartAsSVG,
  formatCurrency,
} from './chartUtils';

export interface CandlestickDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface CandlestickChartProps {
  data: CandlestickDataPoint[];
  title?: string;
  height?: number;
  showExport?: boolean;
  showVolume?: boolean;
  currency?: string;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  title = 'Price Chart',
  height = 500,
  showExport = true,
  showVolume = true,
  currency = 'USD',
}) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  const chartRef = useRef<any>(null);
  const theme = getChartTheme(isDark);

  const chartOption: EChartsOption = useMemo(() => {
    const dates = data.map(d => d.date);
    const ohlcData = data.map(d => [d.open, d.close, d.low, d.high]);
    const volumeData = data.map(d => d.volume || 0);

    const gridConfig = showVolume
      ? [
          { left: '10%', right: '10%', top: '12%', height: '50%' },
          { left: '10%', right: '10%', top: '68%', height: '16%' },
        ]
      : [{ left: '10%', right: '10%', top: '12%', bottom: '18%' }];

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
        trigger: 'axis',
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        textStyle: {
          color: theme.textColor,
        },
        axisPointer: {
          type: 'cross',
        },
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params;
          if (!param || !param.data) return '';

          const dataIndex = param.dataIndex;
          const dateStr = dates[dataIndex];
          const [open, close, low, high] = param.data;

          let html = `<strong>${dateStr}</strong><br/>`;
          html += `Open: ${formatCurrency(open, currency)}<br/>`;
          html += `High: ${formatCurrency(high, currency)}<br/>`;
          html += `Low: ${formatCurrency(low, currency)}<br/>`;
          html += `Close: ${formatCurrency(close, currency)}<br/>`;

          if (showVolume && volumeData[dataIndex]) {
            html += `Volume: ${volumeData[dataIndex].toLocaleString()}`;
          }

          return html;
        },
      },
      grid: gridConfig,
      xAxis: showVolume
        ? [
            {
              type: 'category',
              data: dates,
              gridIndex: 0,
              axisLabel: {
                show: false,
              },
              axisLine: {
                lineStyle: {
                  color: theme.axisLineColor,
                },
              },
            },
            {
              type: 'category',
              data: dates,
              gridIndex: 1,
              axisLabel: {
                color: theme.textColor,
                fontSize: 10,
              },
              axisLine: {
                lineStyle: {
                  color: theme.axisLineColor,
                },
              },
            },
          ]
        : [
            {
              type: 'category',
              data: dates,
              axisLabel: {
                color: theme.textColor,
                fontSize: 10,
              },
              axisLine: {
                lineStyle: {
                  color: theme.axisLineColor,
                },
              },
            },
          ],
      yAxis: showVolume
        ? [
            {
              type: 'value',
              gridIndex: 0,
              scale: true,
              splitNumber: 4,
              axisLabel: {
                color: theme.textColor,
                formatter: (value: number) => formatCurrency(value, currency),
              },
              splitLine: {
                lineStyle: {
                  color: theme.splitLineColor,
                },
              },
            },
            {
              type: 'value',
              gridIndex: 1,
              scale: true,
              splitNumber: 2,
              axisLabel: {
                show: false,
              },
              splitLine: {
                show: false,
              },
            },
          ]
        : [
            {
              type: 'value',
              scale: true,
              splitNumber: 4,
              axisLabel: {
                color: theme.textColor,
                formatter: (value: number) => formatCurrency(value, currency),
              },
              splitLine: {
                lineStyle: {
                  color: theme.splitLineColor,
                },
              },
            },
          ],
      dataZoom: getDataZoomConfig(isDark),
      series: [
        {
          type: 'candlestick' as const,
          data: ohlcData,
          xAxisIndex: 0,
          yAxisIndex: 0,
          itemStyle: {
            color: '#10b981',
            color0: '#ef4444',
            borderColor: '#10b981',
            borderColor0: '#ef4444',
          },
          emphasis: {
            itemStyle: {
              borderWidth: 2,
            },
          },
        },
        ...(showVolume
          ? [
              {
                type: 'bar' as const,
                data: volumeData,
                xAxisIndex: 1,
                yAxisIndex: 1,
                itemStyle: {
                  color: (params: any) => {
                    const index = params.dataIndex;
                    const ohlc = ohlcData[index];
                    return ohlc[1] >= ohlc[0] ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)';
                  },
                },
              },
            ]
          : []),
      ],
    };
  }, [data, title, isDark, theme, showVolume, currency]);

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

export default CandlestickChart;
