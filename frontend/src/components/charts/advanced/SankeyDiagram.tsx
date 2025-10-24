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

export interface SankeyNode {
  name: string;
  depth?: number; // Optional: control node positioning
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyDiagramProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  title?: string;
  height?: number;
  showExport?: boolean;
  currency?: string;
}

const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
  nodes,
  links,
  title = 'Fund Flow Analysis',
  height = 500,
  showExport = true,
  currency = 'USD',
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
      tooltip: {
        trigger: 'item',
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        textStyle: {
          color: theme.textColor,
        },
        formatter: (params: any) => {
          if (params.dataType === 'edge') {
            return `<strong>${params.data.source} → ${params.data.target}</strong><br/>Amount: ${formatCurrency(params.value, currency)}`;
          } else {
            return `<strong>${params.name}</strong>`;
          }
        },
      },
      series: [
        {
          type: 'sankey',
          layout: 'none',
          emphasis: {
            focus: 'adjacency',
          },
          data: nodes.map((node, index) => ({
            name: node.name,
            depth: node.depth,
            itemStyle: {
              color: chartColors.primary[index % chartColors.primary.length],
              borderColor: isDark ? '#4b5563' : '#e5e7eb',
              borderWidth: 1,
            },
            label: {
              color: theme.textColor,
              fontSize: 12,
              fontWeight: 'bold',
            },
          })),
          links: links.map(link => ({
            source: link.source,
            target: link.target,
            value: link.value,
            lineStyle: {
              opacity: 0.3,
            },
          })),
          lineStyle: {
            color: 'gradient',
            curveness: 0.5,
          },
          label: {
            position: 'right',
            fontSize: 11,
          },
          left: '5%',
          right: '20%',
          top: '15%',
          bottom: '10%',
        },
      ],
    };
  }, [nodes, links, title, isDark, theme, currency]);

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

  if (!nodes || nodes.length === 0 || !links || links.length === 0) {
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

export default SankeyDiagram;
