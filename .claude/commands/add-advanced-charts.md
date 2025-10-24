# Add Advanced Charts

Implement advanced chart types for better data visualization: waterfall, heat maps, Sankey, candlestick, and bubble charts.

## New Chart Types

1. **Waterfall Chart** - Attribution analysis breakdown
2. **Heat Map** - Correlation matrix, risk heat map
3. **Sankey Diagram** - Flow of funds, allocation changes over time
4. **Candlestick Chart** - Price movements with OHLC data
5. **Bubble Chart** - Risk vs return visualization
6. **Radar Chart** - Multi-metric comparison
7. **Treemap** - Portfolio allocation visualization

## Implementation
- Consider D3.js or Apache ECharts for advanced charts
- Or extend Recharts with custom components
- Interactive features:
  - Zoom & pan
  - Drill-down (click segment to filter/navigate)
  - Tooltips with detailed data
  - Export charts as PNG/SVG
  - Comparison overlays (multiple portfolios on one chart)
- Responsive design (charts adapt to container size)
- Dark mode support

## Frontend
- Create chart components in `frontend/src/components/charts/advanced/`
- Use charts in analytics views
- Add chart type selector where appropriate

## Testing
- Test chart rendering with various datasets
- Test interactions (zoom, drill-down)
- Test export functionality
- Test responsiveness

## Files
- `frontend/src/components/charts/advanced/WaterfallChart.tsx` (NEW)
- `frontend/src/components/charts/advanced/HeatMap.tsx` (NEW)
- `frontend/src/components/charts/advanced/SankeyDiagram.tsx` (NEW)
- And others...

Execute end-to-end autonomously.
