import type { EChartsOption } from 'echarts';

/**
 * Export chart as PNG image
 */
export const exportChartAsPNG = (chartInstance: any, fileName: string = 'chart'): void => {
  if (!chartInstance) return;

  const url = chartInstance.getDataURL({
    pixelRatio: 2,
    backgroundColor: '#fff'
  });

  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.png`;
  link.click();
};

/**
 * Export chart as SVG image
 */
export const exportChartAsSVG = (chartInstance: any, fileName: string = 'chart'): void => {
  if (!chartInstance) return;

  const url = chartInstance.getDataURL({
    type: 'svg',
    backgroundColor: '#fff'
  });

  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.svg`;
  link.click();
};

/**
 * Get theme colors based on dark mode
 */
export const getChartTheme = (isDark: boolean) => ({
  backgroundColor: isDark ? '#1f2937' : '#ffffff',
  textColor: isDark ? '#e5e7eb' : '#374151',
  axisLineColor: isDark ? '#4b5563' : '#e5e7eb',
  splitLineColor: isDark ? '#374151' : '#f3f4f6',
  tooltipBg: isDark ? '#374151' : '#ffffff',
  tooltipBorder: isDark ? '#4b5563' : '#e5e7eb',
  gridBorderColor: isDark ? '#4b5563' : '#e5e7eb',
});

/**
 * Common grid configuration
 */
export const getGridConfig = (hasLegend: boolean = false) => ({
  left: '3%',
  right: '4%',
  bottom: '3%',
  top: hasLegend ? '15%' : '10%',
  containLabel: true,
});

/**
 * Common tooltip configuration
 */
export const getTooltipConfig = (isDark: boolean): EChartsOption['tooltip'] => ({
  trigger: 'axis' as const,
  backgroundColor: isDark ? '#374151' : '#ffffff',
  borderColor: isDark ? '#4b5563' : '#e5e7eb',
  borderWidth: 1,
  textStyle: {
    color: isDark ? '#e5e7eb' : '#374151',
  },
  axisPointer: {
    type: 'shadow' as const,
    shadowStyle: {
      color: isDark ? 'rgba(150, 150, 150, 0.1)' : 'rgba(150, 150, 150, 0.1)',
    },
  },
});

/**
 * Common legend configuration
 */
export const getLegendConfig = (isDark: boolean): EChartsOption['legend'] => ({
  top: '2%',
  textStyle: {
    color: isDark ? '#e5e7eb' : '#374151',
  },
});

/**
 * Color palettes for charts
 */
export const chartColors = {
  primary: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#84cc16'],
  positive: ['#10b981', '#34d399', '#6ee7b7'],
  negative: ['#ef4444', '#f87171', '#fca5a5'],
  neutral: ['#6b7280', '#9ca3af', '#d1d5db'],
  risk: ['#10b981', '#84cc16', '#f59e0b', '#f97316', '#ef4444'],
  sequential: ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'],
};

/**
 * Format large numbers with abbreviations
 */
export const formatLargeNumber = (value: number): string => {
  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

/**
 * Format percentage values
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format currency values
 */
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Get color based on value (positive/negative)
 */
export const getValueColor = (value: number): string => {
  if (value > 0) return '#10b981';
  if (value < 0) return '#ef4444';
  return '#6b7280';
};

/**
 * Create responsive font size configuration
 */
export const getResponsiveFontSize = (baseSize: number = 12) => ({
  fontSize: baseSize,
  fontFamily: 'system-ui, -apple-system, sans-serif',
});

/**
 * Enable data zoom configuration for large datasets
 */
export const getDataZoomConfig = (isDark: boolean) => [
  {
    type: 'inside' as const,
    start: 0,
    end: 100,
  },
  {
    type: 'slider' as const,
    start: 0,
    end: 100,
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
    fillerColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
    borderColor: isDark ? '#4b5563' : '#e5e7eb',
    textStyle: {
      color: isDark ? '#e5e7eb' : '#374151',
    },
  },
];

/**
 * Add animation configuration
 */
export const getAnimationConfig = () => ({
  animation: true,
  animationDuration: 1000,
  animationEasing: 'cubicOut' as const,
});
