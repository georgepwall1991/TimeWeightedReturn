import React, { useState, useMemo } from "react";
import { Search, TrendingUp, TrendingDown, DollarSign, BarChart3, Filter, Calendar, Clock, RefreshCw, ChevronDown, ChevronUp, Info, Download, LineChart, PieChart, CalendarRange, X, ArrowRight, ArrowLeft } from "lucide-react";
import { api } from "../../services/api";
import { formatCurrency, formatPercentage } from "../../utils/formatters";
import type { HoldingDto } from "../../types/api";
import { CalculationErrorBoundary } from "../layout/CalculationErrorBoundary";
import { HoldingsCompositionChart } from "../charts";
import { DateRangePicker } from "../common/DateRangePicker";
import { HoldingsComparisonChart } from "../charts/HoldingsComparisonChart";
import { HoldingsPerformanceChart } from "../charts/HoldingsPerformanceChart";

interface HoldingsExplorerProps {
  accountId: string;
  accountName: string;
}

type SortField = "name" | "value" | "units" | "price" | "change";
type SortDirection = "asc" | "desc";

interface DateRange {
  start: string;
  end: string;
}

interface ComparisonState {
  isComparing: boolean;
  baseDate: string;
  compareDate: string;
}

const HoldingsExplorer: React.FC<HoldingsExplorerProps> = ({
  accountId,
  accountName,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedInstrumentType, setSelectedInstrumentType] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDataInfo, setShowDataInfo] = useState(false);
  const [viewMode, setViewMode] = useState<'holdings' | 'analytics'>('holdings');
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [comparison, setComparison] = useState<ComparisonState>({
    isComparing: false,
    baseDate: '',
    compareDate: ''
  });
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Fetch available dates
  const { data: datesData, isLoading: isLoadingDates } = api.useGetAccountDatesQuery({ accountId });

  // Fetch holdings data for current date
  const { data: holdingsData, isLoading: isLoadingHoldings, error } = api.useGetAccountHoldingsQuery({
    accountId: accountId,
    date: selectedDate,
  });

  // Fetch holdings data for comparison date
  const { data: comparisonData } = api.useGetAccountHoldingsQuery({
    accountId: accountId,
    date: comparison.compareDate,
  }, { skip: !comparison.isComparing });

  // Fetch historical holdings data for analytics
  const { data: historicalData } = api.useGetAccountHoldingsHistoryQuery({
    accountId: accountId,
    startDate: dateRange.start,
    endDate: dateRange.end,
  }, { skip: viewMode !== 'analytics' });

  // Calculate data freshness
  const dataFreshness = useMemo(() => {
    if (!holdingsData?.actualDate) return null;
    const dataDate = new Date(holdingsData.actualDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - dataDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { status: 'fresh', message: 'Data is current' };
    if (diffDays === 1) return { status: 'yesterday', message: 'Data is from yesterday' };
    if (diffDays <= 7) return { status: 'recent', message: `Data is ${diffDays} days old` };
    return { status: 'stale', message: `Data is ${diffDays} days old` };
  }, [holdingsData?.actualDate]);

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

  const handleLatestData = () => {
    if (datesData?.dates.length) {
      setSelectedDate(datesData.dates[datesData.dates.length - 1]);
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const response = await api.exportHoldings({
        accountId,
        date: selectedDate,
        format
      });

      // Create a download link
      const blob = new Blob([response], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `holdings-${accountName}-${selectedDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      // TODO: Add proper error handling/notification
    }
  };

  const handleCompareDates = () => {
    if (!comparison.baseDate) {
      setComparison(prev => ({ ...prev, baseDate: selectedDate }));
    } else if (!comparison.compareDate) {
      setComparison(prev => ({ ...prev, compareDate: selectedDate, isComparing: true }));
    }
  };

  const clearComparison = () => {
    setComparison({ isComparing: false, baseDate: '', compareDate: '' });
  };

  if (isLoadingDates || isLoadingHoldings) {
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
              <h2 className="text-lg font-semibold text-gray-900">{accountName}</h2>
              <p className="text-sm text-gray-500">Holdings Explorer</p>
            </div>
          </div>

          {/* Date Controls and Data Status */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleLatestData}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={isLoadingDates}
              >
                <RefreshCw className="w-4 h-4" />
                Latest Data
              </button>

              <div className="relative">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    disabled={isLoadingDates}
                    className="block w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    {isLoadingDates ? (
                      <option>Loading dates...</option>
                    ) : (
                      datesData?.dates.map((date) => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString()}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setShowDataInfo(!showDataInfo)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Data Information"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* Data Status Information */}
            {holdingsData && (
              <div className="flex items-center gap-3 text-sm">
                {dataFreshness && (
                  <div className={`flex items-center gap-1 ${
                    dataFreshness.status === 'fresh' ? 'text-green-600' :
                    dataFreshness.status === 'yesterday' ? 'text-blue-600' :
                    dataFreshness.status === 'recent' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span>{dataFreshness.message}</span>
                  </div>
                )}

                {holdingsData.dataStatus === 'NoData' ? (
                  <p className="text-red-600">No holdings data available</p>
                ) : holdingsData.dataStatus === 'Nearest' ? (
                  <p className="text-amber-600">
                    Showing nearest available date: {new Date(holdingsData.actualDate).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-green-600">
                    Data available from {new Date(holdingsData.availableDateRange?.earliest ?? '').toLocaleDateString()}
                    to {new Date(holdingsData.availableDateRange?.latest ?? '').toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Expanded Data Info */}
            {showDataInfo && holdingsData && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <h4 className="font-medium mb-2">Data Information</h4>
                <ul className="space-y-1">
                  <li>Total available dates: {holdingsData.availableDateRange?.totalDates}</li>
                  <li>Data frequency: {calculateDataFrequency(holdingsData.availableDateRange)}</li>
                  <li>Last update: {new Date(holdingsData.actualDate).toLocaleString()}</li>
                  {holdingsData.dataStatus === 'Nearest' && (
                    <li className="text-amber-600">
                      Note: Showing nearest available date to requested date
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('holdings')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                viewMode === 'holdings'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline-block mr-1" />
              Holdings
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                viewMode === 'analytics'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LineChart className="w-4 h-4 inline-block mr-1" />
              Analytics
            </button>
          </div>

          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('csv')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Date Controls */}
        <div className="flex flex-col gap-4">
          {viewMode === 'analytics' ? (
            <DateRangePicker
              startDate={dateRange.start}
              endDate={dateRange.end}
              availableDates={datesData?.dates ?? []}
              onChange={setDateRange}
            />
          ) : (
            <div className="flex items-center gap-2">
              {/* Date Comparison Controls */}
              <div className="flex items-center gap-2">
                {!comparison.isComparing ? (
                  <button
                    onClick={handleCompareDates}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100"
                  >
                    <CalendarRange className="w-4 h-4" />
                    {comparison.baseDate ? 'Select Compare Date' : 'Compare Dates'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-md">
                    <span className="text-sm text-purple-600">
                      Comparing {new Date(comparison.baseDate).toLocaleDateString()}
                      <ArrowRight className="w-4 h-4 inline mx-1" />
                      {new Date(comparison.compareDate).toLocaleDateString()}
                    </span>
                    <button
                      onClick={clearComparison}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filters Toggle */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search holdings..."
              className="block w-64 rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instrument Type
                </label>
                <select
                  value={selectedInstrumentType}
                  onChange={(e) => setSelectedInstrumentType(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                >
                  <option value="all">All Types</option>
                  <option value="Security">Securities</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              {/* Add more filters here as needed */}
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        {holdingsData && holdingsData.dataStatus !== 'NoData' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Total Value</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatCurrency(summary.totalValue)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Holdings</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {summary.totalHoldings}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Average Value</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatCurrency(summary.avgValue)}
              </p>
            </div>
            {summary.largestHolding && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Largest Holding</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {summary.largestHolding.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(summary.largestHolding.valueGBP)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      {viewMode === 'analytics' ? (
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Over Time</h3>
              <HoldingsPerformanceChart data={historicalData} />
            </div>

            {/* Composition Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Holdings Composition</h3>
              <HoldingsCompositionChart data={holdingsData?.holdings} />
            </div>

            {/* Additional Analytics */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Add more analytics cards here */}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Comparison View */}
          {comparison.isComparing && (
            <div className="p-6 border-b border-gray-200">
              <HoldingsComparisonChart
                baseData={holdingsData?.holdings}
                compareData={comparisonData?.holdings}
                baseDate={comparison.baseDate}
                compareDate={comparison.compareDate}
              />
            </div>
          )}

          {/* Holdings Table */}
          {holdingsData && holdingsData.dataStatus !== 'NoData' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("name")}>
                      Name {getSortIcon("name")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("value")}>
                      Value {getSortIcon("value")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("units")}>
                      Units {getSortIcon("units")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("price")}>
                      Price {getSortIcon("price")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("change")}>
                      Change {getSortIcon("change")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {holdings.map((holding) => {
                    const performance = getPerformanceIndicator(holding);
                    return (
                      <tr key={holding.instrumentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{holding.name}</div>
                              <div className="text-sm text-gray-500">{holding.ticker}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {formatCurrency(holding.valueGBP)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {holding.units.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {formatCurrency(holding.price)} {holding.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${performance.bgColorClass}`}>
                            <performance.icon className={`w-3 h-3 mr-1 ${performance.colorClass}`} />
                            <span className={performance.colorClass}>
                              {formatPercentage(performance.change)}
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
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">No holdings data available for the selected date</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Helper function to calculate data frequency
function calculateDataFrequency(dateRange?: { earliest: string; latest: string; totalDates: number }): string {
  if (!dateRange) return 'Unknown';

  const totalDays = Math.ceil(
    (new Date(dateRange.latest).getTime() - new Date(dateRange.earliest).getTime()) / (1000 * 60 * 60 * 24)
  );

  const frequency = dateRange.totalDates / totalDays;

  if (frequency >= 0.9) return 'Daily';
  if (frequency >= 0.4) return 'Bi-weekly';
  if (frequency >= 0.2) return 'Weekly';
  if (frequency >= 0.1) return 'Bi-monthly';
  return 'Monthly';
}

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
