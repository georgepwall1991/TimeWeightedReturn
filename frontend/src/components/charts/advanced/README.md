# Advanced Charts Documentation

This directory contains advanced chart components built with Apache ECharts for better data visualization in the portfolio management application.

## Chart Components

### 1. WaterfallChart
Visualizes sequential changes from a starting value to an ending value, perfect for attribution analysis.

**Use Case:** Attribution analysis breakdown, showing how different factors contribute to overall performance.

**Example:**
```tsx
import { WaterfallChart } from './components/charts/advanced';

<WaterfallChart
  data={[
    { name: 'Starting Value', value: 100000, isTotal: true },
    { name: 'Gains', value: 5000 },
    { name: 'Losses', value: -2000 },
    { name: 'Fees', value: -500 },
    { name: 'Ending Value', value: 102500, isTotal: true },
  ]}
  title="Portfolio Attribution"
  height={400}
  valueType="currency"
  currency="USD"
  showExport={true}
/>
```

**Props:**
- `data`: Array of `WaterfallDataPoint` objects with `name`, `value`, and optional `isTotal`
- `title`: Chart title (default: "Waterfall Analysis")
- `height`: Chart height in pixels (default: 400)
- `showExport`: Show export buttons (default: true)
- `valueType`: "currency" or "percentage" (default: "currency")
- `currency`: Currency code for formatting (default: "USD")

---

### 2. HeatMap
Displays correlation matrices and other 2D data with color-coded cells.

**Use Case:** Asset correlation analysis, risk heat maps, performance matrices.

**Example:**
```tsx
import { HeatMap } from './components/charts/advanced';

<HeatMap
  data={[
    { x: 0, y: 0, value: 1.0 },
    { x: 0, y: 1, value: 0.7 },
    { x: 1, y: 0, value: 0.7 },
    { x: 1, y: 1, value: 1.0 },
  ]}
  xLabels={['Stock A', 'Stock B']}
  yLabels={['Stock A', 'Stock B']}
  title="Asset Correlation Matrix"
  height={500}
  minValue={-1}
  maxValue={1}
/>
```

**Props:**
- `data`: Array of `HeatMapDataPoint` with `x`, `y`, and `value`
- `xLabels`: Labels for x-axis
- `yLabels`: Labels for y-axis
- `title`: Chart title (default: "Correlation Heat Map")
- `height`: Chart height (default: 500)
- `showExport`: Show export buttons (default: true)
- `minValue`: Minimum value for color scale (default: -1)
- `maxValue`: Maximum value for color scale (default: 1)

---

### 3. SankeyDiagram
Shows flow of funds or allocations between different categories.

**Use Case:** Fund flow analysis, allocation changes over time, rebalancing visualization.

**Example:**
```tsx
import { SankeyDiagram } from './components/charts/advanced';

<SankeyDiagram
  nodes={[
    { name: 'Cash' },
    { name: 'Stocks' },
    { name: 'Bonds' },
    { name: 'US Stocks' },
    { name: 'International Stocks' },
  ]}
  links={[
    { source: 'Cash', target: 'Stocks', value: 50000 },
    { source: 'Cash', target: 'Bonds', value: 30000 },
    { source: 'Stocks', target: 'US Stocks', value: 30000 },
    { source: 'Stocks', target: 'International Stocks', value: 20000 },
  ]}
  title="Portfolio Rebalancing Flow"
  height={500}
  currency="USD"
/>
```

**Props:**
- `nodes`: Array of `SankeyNode` objects with `name` and optional `depth`
- `links`: Array of `SankeyLink` with `source`, `target`, and `value`
- `title`: Chart title (default: "Fund Flow Analysis")
- `height`: Chart height (default: 500)
- `showExport`: Show export buttons (default: true)
- `currency`: Currency code (default: "USD")

---

### 4. CandlestickChart
Displays OHLC (Open, High, Low, Close) price data with optional volume.

**Use Case:** Price movement analysis, technical analysis, market data visualization.

**Example:**
```tsx
import { CandlestickChart } from './components/charts/advanced';

<CandlestickChart
  data={[
    { date: '2024-01-01', open: 100, high: 105, low: 98, close: 103, volume: 10000 },
    { date: '2024-01-02', open: 103, high: 108, low: 102, close: 107, volume: 15000 },
    { date: '2024-01-03', open: 107, high: 109, low: 104, close: 105, volume: 12000 },
  ]}
  title="Stock Price Movement"
  height={500}
  showVolume={true}
  currency="USD"
/>
```

**Props:**
- `data`: Array of `CandlestickDataPoint` with OHLC data
- `title`: Chart title (default: "Price Chart")
- `height`: Chart height (default: 500)
- `showExport`: Show export buttons (default: true)
- `showVolume`: Display volume bars (default: true)
- `currency`: Currency code (default: "USD")

**Features:**
- Interactive zoom and pan
- Volume bars with color-coded direction
- Crosshair tooltip with all OHLC values

---

### 5. BubbleChart
Visualizes three dimensions of data using x-position, y-position, and bubble size.

**Use Case:** Risk vs return analysis, portfolio comparison, factor analysis.

**Example:**
```tsx
import { BubbleChart } from './components/charts/advanced';

<BubbleChart
  data={[
    { name: 'Portfolio A', risk: 0.15, return: 0.12, size: 100000, category: 'Conservative' },
    { name: 'Portfolio B', risk: 0.25, return: 0.18, size: 250000, category: 'Moderate' },
    { name: 'Portfolio C', risk: 0.35, return: 0.22, size: 150000, category: 'Aggressive' },
  ]}
  title="Risk vs Return Analysis"
  height={500}
  xAxisLabel="Risk (Volatility)"
  yAxisLabel="Expected Return"
  currency="USD"
/>
```

**Props:**
- `data`: Array of `BubbleDataPoint` with `name`, `risk`, `return`, `size`, and optional `category`
- `title`: Chart title (default: "Risk vs Return Analysis")
- `height`: Chart height (default: 500)
- `showExport`: Show export buttons (default: true)
- `xAxisLabel`: X-axis label (default: "Risk (Volatility)")
- `yAxisLabel`: Y-axis label (default: "Return")
- `currency`: Currency code (default: "USD")

---

### 6. RadarChart
Displays multiple metrics in a circular/radial layout for easy comparison.

**Use Case:** Multi-metric portfolio comparison, performance scorecards, factor analysis.

**Example:**
```tsx
import { RadarChart } from './components/charts/advanced';

<RadarChart
  indicators={[
    { name: 'Returns', max: 100 },
    { name: 'Risk Management', max: 100 },
    { name: 'Diversification', max: 100 },
    { name: 'Liquidity', max: 100 },
    { name: 'Cost Efficiency', max: 100 },
  ]}
  series={[
    { name: 'Portfolio A', values: [85, 70, 90, 80, 75] },
    { name: 'Portfolio B', values: [70, 85, 80, 90, 85] },
  ]}
  title="Portfolio Comparison"
  height={500}
/>
```

**Props:**
- `indicators`: Array of `RadarIndicator` with `name`, `max`, and optional `min`
- `series`: Array of `RadarDataSeries` with `name` and `values`
- `title`: Chart title (default: "Multi-Metric Comparison")
- `height`: Chart height (default: 500)
- `showExport`: Show export buttons (default: true)

---

### 7. TreemapChart
Visualizes hierarchical data with nested rectangles sized by value.

**Use Case:** Portfolio allocation visualization, sector breakdown, asset class distribution.

**Example:**
```tsx
import { TreemapChart } from './components/charts/advanced';

<TreemapChart
  data={[
    {
      name: 'Stocks',
      value: 500000,
      children: [
        { name: 'Tech', value: 200000 },
        { name: 'Healthcare', value: 150000 },
        { name: 'Finance', value: 150000 },
      ],
    },
    {
      name: 'Bonds',
      value: 300000,
      children: [
        { name: 'Government', value: 180000 },
        { name: 'Corporate', value: 120000 },
      ],
    },
  ]}
  title="Portfolio Allocation"
  height={500}
  currency="USD"
  showPercentages={true}
/>
```

**Props:**
- `data`: Array of `TreemapDataNode` with `name`, `value`, and optional `children`
- `title`: Chart title (default: "Portfolio Allocation")
- `height`: Chart height (default: 500)
- `showExport`: Show export buttons (default: true)
- `currency`: Currency code (default: "USD")
- `showPercentages`: Display percentage labels (default: true)

**Features:**
- Interactive drill-down navigation
- Breadcrumb navigation
- Hierarchical visualization with multiple levels

---

## Common Features

All advanced charts include:

- **Dark Mode Support**: Automatically adapts to the app's theme
- **Export Functionality**: Export as PNG or SVG
- **Responsive Design**: Charts adapt to container size
- **Interactive Tooltips**: Rich tooltips with detailed data
- **Smooth Animations**: Professional animations on load and update
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Utilities

The `chartUtils.ts` file provides helper functions:

- `exportChartAsPNG(chartInstance, fileName)`: Export chart as PNG
- `exportChartAsSVG(chartInstance, fileName)`: Export chart as SVG
- `getChartTheme(isDark)`: Get theme colors for dark/light mode
- `formatCurrency(value, currency)`: Format currency values
- `formatPercent(value, decimals)`: Format percentage values
- `formatLargeNumber(value)`: Format large numbers with abbreviations

## TypeScript Support

All components are fully typed with TypeScript interfaces exported for use in your application:

```tsx
import type {
  WaterfallDataPoint,
  HeatMapDataPoint,
  SankeyNode,
  SankeyLink,
  CandlestickDataPoint,
  BubbleDataPoint,
  RadarIndicator,
  RadarDataSeries,
  TreemapDataNode,
} from './components/charts/advanced';
```

## Performance Tips

1. **Large Datasets**: Use data aggregation or sampling for datasets with > 1000 points
2. **Animation**: Disable animations for frequently updating charts by modifying `getAnimationConfig()`
3. **Memory**: Destroy chart instances when unmounting components (handled automatically)
4. **Rendering**: Use `React.memo()` for components that render multiple charts

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Touch interactions supported

## Dependencies

- `echarts`: ^5.x
- `echarts-for-react`: ^3.x
- `react`: ^18.x or ^19.x

## Example Integration

See the following files for real-world usage examples:
- `frontend/src/components/analytics/AttributionAnalysis.tsx` - WaterfallChart usage
- `frontend/src/components/analytics/RiskAnalyticsDashboard.tsx` - RadarChart usage
