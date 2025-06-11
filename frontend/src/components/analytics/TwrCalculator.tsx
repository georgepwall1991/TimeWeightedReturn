import React, { useState } from "react";
import { api } from "../../services/api";
import { formatPercentage } from "../../utils/formatters";

interface TwrCalculatorProps {
  accountId: string;
  accountName: string;
}

const TwrCalculator: React.FC<TwrCalculatorProps> = ({
  accountId,
  accountName,
}) => {
  const [selectedRange, setSelectedRange] = useState<string>("1Y");
  const [customRange, setCustomRange] = useState({
    from: "",
    to: "",
  });

  // Predefined date ranges
  const dateRanges = {
    "1M": () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      return { from: start.toISOString().split("T")[0], to: end.toISOString().split("T")[0] };
    },
    "3M": () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      return { from: start.toISOString().split("T")[0], to: end.toISOString().split("T")[0] };
    },
    "6M": () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 6);
      return { from: start.toISOString().split("T")[0], to: end.toISOString().split("T")[0] };
    },
    "1Y": () => {
      const end = new Date();
      const start = new Date();
      start.setFullYear(start.getFullYear() - 1);
      return { from: start.toISOString().split("T")[0], to: end.toISOString().split("T")[0] };
    },
  };

  // Get current date range
  const getCurrentRange = () => {
    if (selectedRange === "Custom") {
      return customRange;
    }
    return dateRanges[selectedRange as keyof typeof dateRanges]();
  };

  const {
    data: twrData,
    isLoading,
    error,
    refetch,
  } = api.useCalculateTWRQuery(
    {
      accountId,
      ...getCurrentRange(),
    },
    {
      skip: selectedRange === "Custom" && (!customRange.from || !customRange.to),
    }
  );

  const isPositiveReturn = twrData && twrData.timeWeightedReturn >= 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Time Weighted Return
          </h3>
          <p className="text-sm text-gray-600">{accountName}</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Period
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(dateRanges).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedRange === range
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
              }`}
            >
              {range}
            </button>
          ))}
          <button
            onClick={() => setSelectedRange("Custom")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedRange === "Custom"
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
            }`}
          >
            Custom
          </button>
        </div>

        {/* Custom Date Range */}
        {selectedRange === "Custom" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <input
                type="date"
                value={customRange.from}
                onChange={(e) =>
                  setCustomRange((prev) => ({ ...prev, from: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type="date"
                value={customRange.to}
                onChange={(e) =>
                  setCustomRange((prev) => ({ ...prev, to: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Display */}
      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Calculating TWR...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Calculation Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Unable to calculate TWR for the selected period.</p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => refetch()}
                    className="bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium py-1 px-3 rounded-md transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {twrData && (
          <div className="space-y-4">
            <div className="text-center">
              <div
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  isPositiveReturn
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <span className="text-2xl font-bold">
                  {formatPercentage(twrData.timeWeightedReturn)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Time Weighted Return
              </p>
            </div>

            {twrData.annualizedReturn && (
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700">
                  {formatPercentage(twrData.annualizedReturn)}
                </div>
                <p className="text-sm text-gray-600">Annualized Return</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Period: {getCurrentRange().from} to {getCurrentRange().to}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Sub-periods: {twrData.subPeriods?.length || 1}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwrCalculator;
