import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { formatPercentage } from '../../utils/formatters';

interface RiskMetricsData {
  annualizedVolatility: number;
  sharpeRatio: number;
  maximumDrawdown: number;
  currentDrawdown: number;
  valueAtRisk95: number;
  annualizedReturn: number;
  riskScore: number;
  riskProfile: string;
  drawdownPeriods: DrawdownPeriod[];
  rollingVolatility: RollingVolatilityPoint[];
}

interface DrawdownPeriod {
  startDate: string;
  endDate: string;
  maxDrawdown: number;
  durationDays: number;
  isRecovered: boolean;
}

interface RollingVolatilityPoint {
  date: string;
  annualizedVolatility: number;
}

interface RiskMetricsChartProps {
  data: RiskMetricsData;
  title?: string;
  height?: number;
}

const RiskMetricsChart: React.FC<RiskMetricsChartProps> = ({
  data,
  title = "Risk Metrics Analysis",
  height = 300
}) => {
  const rollingVolatilityData = useMemo(() => {
    return data.rollingVolatility.map(point => ({
      date: point.date,
      volatility: point.annualizedVolatility * 100,
      formattedDate: new Date(point.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }));
  }, [data.rollingVolatility]);

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 7) return "#10B981"; // Green - Low risk
    if (riskScore >= 5) return "#F59E0B"; // Yellow - Medium risk
    return "#EF4444"; // Red - High risk
  };

  const getSharpeColor = (sharpe: number) => {
    if (sharpe > 1.5) return "#10B981"; // Excellent
    if (sharpe > 1.0) return "#84CC16"; // Good
    if (sharpe > 0.5) return "#F59E0B"; // Fair
    return "#EF4444"; // Poor
  };

  // Define proper tooltip payload interface
  interface TooltipPayload {
    payload: RollingVolatilityPoint & {
      formattedDate: string;
      volatility: number;
    };
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">{data.formattedDate}</p>
          <div className="text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Volatility:</span>
              <span className="font-medium text-gray-900">
                {formatPercentage(data.volatility / 100)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data || data.rollingVolatility.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No risk data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="text-gray-500">Risk Profile:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              data.riskProfile === 'Conservative' ? 'bg-green-100 text-green-800' :
              data.riskProfile === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {data.riskProfile}
            </span>
          </div>
        </div>
      </div>

      {/* Key Risk Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium mb-1">Volatility</div>
          <div className="text-xl font-bold text-blue-700">
            {formatPercentage(data.annualizedVolatility)}
          </div>
          <div className="text-xs text-blue-500">Annualized</div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium mb-1">Sharpe Ratio</div>
          <div className={`text-xl font-bold ${getSharpeColor(data.sharpeRatio) === '#10B981' ? 'text-green-700' :
            getSharpeColor(data.sharpeRatio) === '#84CC16' ? 'text-lime-700' :
            getSharpeColor(data.sharpeRatio) === '#F59E0B' ? 'text-amber-700' : 'text-red-700'}`}>
            {data.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-xs text-green-500">Risk-adjusted</div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
          <div className="text-sm text-red-600 font-medium mb-1">Max Drawdown</div>
          <div className="text-xl font-bold text-red-700">
            {formatPercentage(data.maximumDrawdown)}
          </div>
          <div className="text-xs text-red-500">Worst decline</div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium mb-1">VaR (95%)</div>
          <div className="text-xl font-bold text-purple-700">
            {formatPercentage(data.valueAtRisk95)}
          </div>
          <div className="text-xs text-purple-500">Daily risk</div>
        </div>
      </div>

      {/* Rolling Volatility Chart */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Rolling Volatility (30-day)</h4>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={rollingVolatilityData}>
            <defs>
              <linearGradient id="volatilityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="formattedDate"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="volatility"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#volatilityGradient)"
              dot={false}
            />
            <ReferenceLine
              y={data.annualizedVolatility * 100}
              stroke="#EF4444"
              strokeDasharray="5 5"
              label={{ value: "Average", position: "insideTopRight" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Score and Assessment */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Risk Assessment</h4>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Risk Score:</span>
            <div className="flex items-center">
              <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(data.riskScore / 10) * 100}%`,
                    backgroundColor: getRiskColor(data.riskScore)
                  }}
                />
              </div>
              <span className="text-sm font-bold" style={{ color: getRiskColor(data.riskScore) }}>
                {data.riskScore.toFixed(1)}/10
              </span>
            </div>
          </div>
        </div>

        {/* Drawdown Periods */}
        {data.drawdownPeriods.length > 0 && (
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Drawdown Periods</h5>
            <div className="space-y-2">
              {data.drawdownPeriods.slice(0, 3).map((period, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-600">
                      {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                    </span>
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                      period.isRecovered ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {period.isRecovered ? 'Recovered' : 'Ongoing'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-red-600 font-medium mr-2">
                      {formatPercentage(period.maxDrawdown)}
                    </span>
                    <span className="text-gray-500">
                      ({period.durationDays} days)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskMetricsChart;
