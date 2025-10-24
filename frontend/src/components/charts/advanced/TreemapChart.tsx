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
  formatCurrency,
  chartColors,
} from './chartUtils';

export interface TreemapDataNode {
  name: string;
  value: number;
  children?: TreemapDataNode[];
  itemStyle?: {
    color?: string;
  };
}

interface TreemapChartProps {
  data: TreemapDataNode[];
  title?: string;
  height?: number;
  showExport?: boolean;
  currency?: string;
  showPercentages?: boolean;
}

const TreemapChart: React.FC<TreemapChartProps> = ({
  data,
  title = 'Portfolio Allocation',
  height = 500,
  showExport = true,
  currency = 'USD',
  showPercentages = true,
}) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  const chartRef = useRef<any>(null);
  const theme = getChartTheme(isDark);

  const chartOption: EChartsOption = useMemo(() => {
    // Calculate total value for percentage calculations
    const calculateTotal = (nodes: TreemapDataNode[]): number => {
      return nodes.reduce((sum, node) => {
        if (node.children) {
          return sum + calculateTotal(node.children);
        }
        return sum + node.value;
      }, 0);
    };

    const totalValue = calculateTotal(data);

    // Add colors to nodes if not specified
    const addColorsToNodes = (nodes: TreemapDataNode[], depth = 0): TreemapDataNode[] => {
      return nodes.map((node, index) => {
        const colorIndex = (depth * 3 + index) % chartColors.primary.length;
        return {
          ...node,
          itemStyle: node.itemStyle || {
            color: chartColors.primary[colorIndex],
          },
          children: node.children ? addColorsToNodes(node.children, depth + 1) : undefined,
        };
      });
    };

    const coloredData = addColorsToNodes(data);

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
        trigger: 'item',
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        textStyle: {
          color: theme.textColor,
        },
        formatter: (params: any) => {
          const percentage = ((params.value / totalValue) * 100).toFixed(2);
          let html = `<strong>${params.name}</strong><br/>`;
          html += `Value: ${formatCurrency(params.value, currency)}<br/>`;
          if (showPercentages) {
            html += `Percentage: ${percentage}%`;
          }
          return html;
        },
      },
      series: [
        {
          type: 'treemap',
          data: coloredData,
          roam: false,
          breadcrumb: {
            show: true,
            itemStyle: {
              color: isDark ? '#4b5563' : '#e5e7eb',
              textStyle: {
                color: theme.textColor,
              },
            },
          },
          label: {
            show: true,
            formatter: (params: any) => {
              const percentage = ((params.value / totalValue) * 100).toFixed(1);
              if (showPercentages) {
                return `{name|${params.name}}\n{value|${formatCurrency(params.value, currency)}}\n{percent|${percentage}%}`;
              }
              return `{name|${params.name}}\n{value|${formatCurrency(params.value, currency)}}`;
            },
            rich: {
              name: {
                fontSize: 14,
                fontWeight: 'bold',
                color: '#ffffff',
                textShadowBlur: 2,
                textShadowColor: 'rgba(0, 0, 0, 0.5)',
              },
              value: {
                fontSize: 12,
                color: '#ffffff',
                textShadowBlur: 2,
                textShadowColor: 'rgba(0, 0, 0, 0.5)',
                padding: [5, 0, 0, 0],
              },
              percent: {
                fontSize: 11,
                color: '#ffffff',
                textShadowBlur: 2,
                textShadowColor: 'rgba(0, 0, 0, 0.5)',
                padding: [2, 0, 0, 0],
              },
            },
          },
          upperLabel: {
            show: true,
            height: 30,
            color: '#fff',
            textBorderColor: 'transparent',
          },
          itemStyle: {
            borderColor: isDark ? '#1f2937' : '#ffffff',
            borderWidth: 2,
            gapWidth: 2,
          },
          emphasis: {
            itemStyle: {
              borderColor: isDark ? '#fff' : '#000',
              borderWidth: 3,
            },
            label: {
              fontSize: 16,
            },
          },
          levels: [
            {
              itemStyle: {
                borderWidth: 3,
                borderColor: isDark ? '#374151' : '#e5e7eb',
                gapWidth: 3,
              },
            },
            {
              itemStyle: {
                borderWidth: 2,
                gapWidth: 2,
              },
            },
            {
              itemStyle: {
                borderWidth: 1,
                gapWidth: 1,
              },
            },
          ],
        },
      ],
    };
  }, [data, title, isDark, theme, currency, showPercentages]);

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

export default TreemapChart;
