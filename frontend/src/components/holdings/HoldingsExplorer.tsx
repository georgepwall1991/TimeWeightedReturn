import React, { useState, useMemo } from "react";
import { Search, TrendingUp, TrendingDown, DollarSign, Percent, BarChart3, Filter } from "lucide-react";
import { api } from "../../services/api";
import { formatCurrency, formatPercentage } from "../../utils/formatters";
import type { HoldingDto } from "../../types/api";
import { CalculationErrorBoundary } from "../layout/CalculationErrorBoundary";
import { HoldingsCompositionChart } from "../charts";

interface HoldingsExplorerProps {
  accountId: string;
  accountName: string;
}

type SortField = "name" | "value" | "units" | "price" | "change";
type SortDirection = "asc" | "desc";

const HoldingsExplorer: React.FC<HoldingsExplorerProps> = ({
  accountId,
  accountName,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedInstrumentType, setSelectedInstrumentType] = useState<string>("all");

  // Fetch holdings data
  const { data: holdingsData, isLoading, error } = api.useGetAccountHoldingsQuery({
    accountId: accountId,
    date: new Date().toISOString().split('T')[0],
  });

  // Filter and sort holdings
  const processedHoldings = useMemo(() => {
    if (!holdingsData?.holdings) return [];

    let filtered = holdingsData.holdings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (holding) =>
          holding.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          holding.ticker.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by instrument type
    if (selectedInstrumentType !== "all") {
      filtered = filtered.filter(
        (holding) => holding.instrumentType === selectedInstrumentType
      );
    }

    // Sort holdings (create a copy to avoid mutating Redux state)
    const sorted = [...filtered].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "value":
          aValue = a.valueGBP;
          bValue = b.valueGBP;
          break;
        case "units":
          aValue = a.units;
          bValue = b.units;
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "change":
          // Mock percentage change calculation
          aValue = (a.price - 100) / 100; // Assuming base price of 100
          bValue = (b.price - 100) / 100;
          break;
        default:
          aValue = a.valueGBP;
          bValue = b.valueGBP;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return sorted;
  }, [holdingsData?.holdings, searchTerm, selectedInstrumentType, sortField, sortDirection]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!processedHoldings.length) {
      return {
        totalValue: 0,
        totalHoldings: 0,
        avgValue: 0,
        largestHolding: null,
        instrumentTypes: [],
      };
    }

    const totalValue = processedHoldings.reduce((sum, h) => sum + h.valueGBP, 0);
    const avgValue = totalValue / processedHoldings.length;
    const largestHolding = processedHoldings.reduce((max, h) =>
      h.valueGBP > max.valueGBP ? h : max
    );

    const instrumentTypes = Array.from(
      new Set(processedHoldings.map(h => h.instrumentType))
    );

    return {
      totalValue,
      totalHoldings: processedHoldings.length,
      avgValue,
      largestHolding,
      instrumentTypes,
    };
  }, [processedHoldings]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getPerformanceIndicator = (holding: HoldingDto) => {
    // Mock performance calculation
    const change = (holding.price - 100) / 100;
    const isPositive = change >= 0;

    return {
      change,
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
      colorClass: isPositive ? "text-green-600" : "text-red-600",
      bgColorClass: isPositive ? "bg-green-50" : "bg-red-50",
    };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading holdings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">
                Unable to load holdings
              </h4>
              <p className="text-sm text-red-700 mt-1">
                Holdings data is not available for this account.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const holdings = processedHoldings;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Holdings Explorer
              </h3>
              <p className="text-sm text-gray-500">{accountName}</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Total Value</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(summary.totalValue)}
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Holdings</p>
                <p className="text-lg font-semibold text-gray-900">
                  {summary.totalHoldings}
                </p>
              </div>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Avg Value</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(summary.avgValue)}
                </p>
              </div>
              <Percent className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Largest</p>
                <p className="text-lg font-semibold text-gray-900">
                  {summary.largestHolding
                    ? formatCurrency(summary.largestHolding.valueGBP)
                    : "N/A"
                  }
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Holdings Composition Chart */}
        {holdings.length > 0 && (
          <div className="mb-6">
            <HoldingsCompositionChart
              holdings={holdings.map(h => ({
                ticker: h.ticker,
                name: h.name,
                value: h.valueGBP,
                units: h.units,
                type: h.instrumentType as 'Cash' | 'Security'
              }))}
              title="Portfolio Composition"
              height={300}
              showLegend={true}
            />
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search holdings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedInstrumentType}
              onChange={(e) => setSelectedInstrumentType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Security">Securities</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Instrument {getSortIcon("name")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("units")}
              >
                <div className="flex items-center">
                  Units {getSortIcon("units")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center">
                  Price {getSortIcon("price")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("value")}
              >
                <div className="flex items-center">
                  Value {getSortIcon("value")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("change")}
              >
                <div className="flex items-center">
                  Change {getSortIcon("change")}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Weight
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {holdings.map((holding) => {
              const performance = getPerformanceIndicator(holding);
              const weight = summary.totalValue > 0 ? (holding.valueGBP / summary.totalValue) * 100 : 0;

              return (
                <tr key={holding.instrumentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        holding.instrumentType === 'Security' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {holding.name}
                        </div>
                        <div className="text-sm text-gray-500">{holding.ticker}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {holding.units.toLocaleString('en-GB', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 4
                    })}
                  </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                     {formatCurrency(holding.price)}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(holding.valueGBP)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${performance.bgColorClass} ${performance.colorClass}`}>
                      <performance.icon className="w-3 h-3 mr-1" />
                      {formatPercentage(performance.change)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(weight, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 min-w-[3rem]">
                        {weight.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {holdings.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              No holdings found
            </h3>
            <p className="text-sm text-gray-400">
              {searchTerm || selectedInstrumentType !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No holdings data available for this account"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrapper component with error boundary
const HoldingsExplorerWithErrorBoundary: React.FC<HoldingsExplorerProps> = (props) => {
  const handleRetry = () => {
    // Force refetch or reload
    window.location.reload();
  };

  return (
    <CalculationErrorBoundary onRetry={handleRetry}>
      <HoldingsExplorer {...props} />
    </CalculationErrorBoundary>
  );
};

export default HoldingsExplorerWithErrorBoundary;
