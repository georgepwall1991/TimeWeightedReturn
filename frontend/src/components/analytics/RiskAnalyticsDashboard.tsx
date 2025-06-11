import React, { useState, useMemo } from "react";
import { Shield, TrendingDown, AlertTriangle, Award, Info } from "lucide-react";
import { useCalculateRiskMetricsQuery } from "../../services/api";
import { formatPercentage } from "../../utils/formatters";
import { RiskMetricsChart } from "../charts";
import { CalculationErrorBoundary } from "../layout/CalculationErrorBoundary";

interface RiskAnalyticsDashboardProps {
  accountId: string;
  accountName: string;
}

const RiskAnalyticsDashboard: React.FC<RiskAnalyticsDashboardProps> = ({
  accountId,
  accountName,
}) => {
  const [selectedRange, setSelectedRange] = useState<string>("1Y");
  const [riskFreeRate, setRiskFreeRate] = useState<number>(2.0);

  const dateRanges = useMemo(() => {
    const today = new Date();
    const ranges = {
      "6M": new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()),
      "1Y": new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
      "2Y": new Date(today.getFullYear() - 2, today.getMonth(), today.getDate()),
      "3Y": new Date(today.getFullYear() - 3, today.getMonth(), today.getDate()),
    };

    return Object.entries(ranges).reduce((acc, [key, startDate]) => {
      acc[key] = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      };
      return acc;
    }, {} as Record<string, { startDate: string; endDate: string }>);
  }, []);

  const currentRange = dateRanges[selectedRange];

  const {
    data: riskData,
    isLoading,
    error,
    refetch
  } = useCalculateRiskMetricsQuery(
    {
      accountId,
      startDate: currentRange.startDate,
      endDate: currentRange.endDate,
      riskFreeRate: riskFreeRate / 100, // Convert percentage to decimal
    },
    {
      skip: !accountId || !currentRange,
    }
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Risk Analysis</h2>
            <p className="text-sm text-gray-600">{accountName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !riskData) {
    return (
      <CalculationErrorBoundary onRetry={refetch}>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Analysis</h2>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Failed to load risk analysis</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </CalculationErrorBoundary>
    );
  }

  const getRiskColorClasses = (score: number) => {
    if (score >= 7) return "text-green-700 bg-green-100 border-green-200";
    if (score >= 5) return "text-yellow-700 bg-yellow-100 border-yellow-200";
    return "text-red-700 bg-red-100 border-red-200";
  };

  return (
    <CalculationErrorBoundary onRetry={refetch}>
      <div className="space-y-6">
        {/* Header with Controls */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Risk Analysis
            </h2>
            <p className="text-sm text-gray-600">{accountName}</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Risk-Free Rate Input */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Risk-Free Rate:</label>
              <input
                type="number"
                value={riskFreeRate}
                onChange={(e) => setRiskFreeRate(parseFloat(e.target.value) || 2.0)}
                min="0"
                max="10"
                step="0.1"
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>

            {/* Time Period Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {Object.keys(dateRanges).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedRange === range
                      ? "bg-white text-blue-600 shadow-sm font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Profile Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Risk Profile Summary</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColorClasses(riskData.riskAssessment.riskScore)}`}>
              {riskData.riskProfile} Risk
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Assessment */}
            <div className="space-y-3">
              <div className="flex items-center">
                <Award className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Overall Assessment</span>
              </div>
              <p className="text-sm text-gray-600">{riskData.riskAssessment.overallAssessment}</p>

              {/* Risk Score Visualization */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Risk Score:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(riskData.riskAssessment.riskScore / 10) * 100}%`,
                      backgroundColor: riskData.riskAssessment.riskScore >= 7 ? '#10B981' :
                                     riskData.riskAssessment.riskScore >= 5 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </div>
                <span className="text-xs font-semibold">{riskData.riskAssessment.riskScore.toFixed(1)}/10</span>
              </div>
            </div>

            {/* Positive Factors */}
            {riskData.riskAssessment.positiveFactors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Strengths</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {riskData.riskAssessment.positiveFactors.map((factor, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Warnings */}
            {riskData.riskAssessment.riskWarnings.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Risk Factors</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {riskData.riskAssessment.riskWarnings.map((warning, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Risk Metrics Chart */}
        <RiskMetricsChart
          data={{
            annualizedVolatility: riskData.annualizedVolatility,
            sharpeRatio: riskData.sharpeRatio,
            maximumDrawdown: riskData.maximumDrawdown,
            currentDrawdown: riskData.currentDrawdown,
            valueAtRisk95: riskData.valueAtRisk95,
            annualizedReturn: riskData.annualizedReturn,
            riskScore: riskData.riskAssessment.riskScore,
            riskProfile: riskData.riskProfile,
            drawdownPeriods: riskData.drawdownPeriods,
            rollingVolatility: riskData.rollingVolatility,
          }}
          title="Risk Metrics Over Time"
          height={350}
        />

        {/* Detailed Risk Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Volatility Analysis */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingDown className="w-4 h-4 text-blue-600 mr-2" />
              Volatility Analysis
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Category:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  riskData.riskAssessment.volatilityCategory === 'Low' ? 'bg-green-100 text-green-700' :
                  riskData.riskAssessment.volatilityCategory === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {riskData.riskAssessment.volatilityCategory}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Annualized:</span>
                <span className="text-sm font-bold">{formatPercentage(riskData.annualizedVolatility)}</span>
              </div>
              <div className="pt-2 text-xs text-gray-500">
                Volatility measures how much the portfolio value fluctuates over time.
              </div>
            </div>
          </div>

          {/* Sharpe Ratio Analysis */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-4 h-4 text-green-600 mr-2" />
              Risk-Adjusted Returns
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sharpe Category:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  riskData.riskAssessment.sharpeCategory === 'Excellent' ? 'bg-green-100 text-green-700' :
                  riskData.riskAssessment.sharpeCategory === 'Good' ? 'bg-blue-100 text-blue-700' :
                  riskData.riskAssessment.sharpeCategory === 'Fair' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {riskData.riskAssessment.sharpeCategory}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sharpe Ratio:</span>
                <span className="text-sm font-bold">{riskData.sharpeRatio.toFixed(2)}</span>
              </div>
              <div className="pt-2 text-xs text-gray-500">
                Measures return per unit of risk. Higher values indicate better risk-adjusted performance.
              </div>
            </div>
          </div>

          {/* Drawdown Analysis */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingDown className="w-4 h-4 text-red-600 mr-2" />
              Drawdown Analysis
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Category:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  riskData.riskAssessment.drawdownCategory === 'Minimal' ? 'bg-green-100 text-green-700' :
                  riskData.riskAssessment.drawdownCategory === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {riskData.riskAssessment.drawdownCategory}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Max Drawdown:</span>
                <span className="text-sm font-bold text-red-600">{formatPercentage(riskData.maximumDrawdown)}</span>
              </div>
              {riskData.currentDrawdown > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current:</span>
                  <span className="text-sm font-medium text-red-600">{formatPercentage(riskData.currentDrawdown)}</span>
                </div>
              )}
              <div className="pt-2 text-xs text-gray-500">
                Maximum peak-to-trough decline. Lower values indicate better downside protection.
              </div>
            </div>
          </div>
        </div>

        {/* Data Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Risk Analysis Period</p>
              <p>
                Analysis covers {riskData.days} days from {new Date(riskData.startDate).toLocaleDateString()}
                to {new Date(riskData.endDate).toLocaleDateString()}.
                Risk-free rate used: {formatPercentage(riskData.riskFreeRate)}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CalculationErrorBoundary>
  );
};

export default RiskAnalyticsDashboard;
