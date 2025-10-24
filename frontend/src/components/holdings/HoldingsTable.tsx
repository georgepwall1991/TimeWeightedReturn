import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { formatCurrency, formatPercentage } from "../../utils/formatters";
import type { HoldingDto } from "../../types/api";

interface HoldingsTableProps {
  holdings: HoldingDto[];
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
  showFilters?: boolean;
  title?: string;
}

type SortField = 'ticker' | 'name' | 'units' | 'price' | 'valueGBP' | 'instrumentType';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'cash' | 'security';

const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings = [],
  isLoading = false,
  error,
  onRefresh,
  showFilters = true,
  title = "Holdings"
}) => {
  const [sortField, setSortField] = useState<SortField>('valueGBP');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered and sorted holdings
  const processedHoldings = useMemo(() => {
    let filtered = holdings;

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(h =>
        filterType === 'cash'
          ? h.instrumentType.toLowerCase() === 'cash'
          : h.instrumentType.toLowerCase() !== 'cash'
      );
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(h =>
        h.ticker.toLowerCase().includes(search) ||
        h.name.toLowerCase().includes(search)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'ticker':
          aValue = a.ticker;
          bValue = b.ticker;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'units':
          aValue = a.units;
          bValue = b.units;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'valueGBP':
          aValue = a.valueGBP;
          bValue = b.valueGBP;
          break;
        case 'instrumentType':
          aValue = a.instrumentType;
          bValue = b.instrumentType;
          break;
        default:
          aValue = a.valueGBP;
          bValue = b.valueGBP;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [holdings, sortField, sortDirection, filterType, searchTerm]);

  // Summary calculations
  const summary = useMemo(() => {
    const totalValue = holdings.reduce((sum, h) => sum + h.valueGBP, 0);
    const cashValue = holdings
      .filter(h => h.instrumentType.toLowerCase() === 'cash')
      .reduce((sum, h) => sum + h.valueGBP, 0);
    const securityValue = totalValue - cashValue;

    return {
      totalValue,
      cashValue,
      securityValue,
      cashPercentage: totalValue > 0 ? (cashValue / totalValue) * 100 : 0,
      securityPercentage: totalValue > 0 ? (securityValue / totalValue) * 100 : 0,
      totalPositions: holdings.length,
      filteredPositions: processedHoldings.length
    };
  }, [holdings, processedHoldings]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <TrendingUp className="w-3 h-3 ml-1" />
    ) : (
      <TrendingDown className="w-3 h-3 ml-1" />
    );
  };

  const exportToCSV = () => {
    const headers = ['Ticker', 'Name', 'Type', 'Currency', 'Units', 'Price', 'Local Value', 'FX Rate', 'Value (GBP)'];
    const csvContent = [
      headers.join(','),
      ...processedHoldings.map(h => [
        h.ticker,
        `"${h.name}"`,
        h.instrumentType,
        h.currency,
        h.units,
        h.price,
        h.localValue,
        h.fxRate || 1,
        h.valueGBP
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `holdings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </button>
          )}
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {summary.filteredPositions} of {summary.totalPositions} positions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
            <button
              onClick={exportToCSV}
              className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <PieChart className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">Total Value</p>
                <p className="text-lg font-bold text-blue-900">
                  {formatCurrency(summary.totalValue)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-900">Cash</p>
                <p className="text-lg font-bold text-green-900">
                  {formatCurrency(summary.cashValue)}
                </p>
                <p className="text-xs text-green-700">
                  {formatPercentage(summary.cashPercentage / 100)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-purple-900">Securities</p>
                <p className="text-lg font-bold text-purple-900">
                  {formatCurrency(summary.securityValue)}
                </p>
                <p className="text-xs text-purple-700">
                  {formatPercentage(summary.securityPercentage / 100)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-gray-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-900">Positions</p>
                <p className="text-lg font-bold text-gray-900">
                  {summary.totalPositions}
                </p>
                <p className="text-xs text-gray-700">Total holdings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by ticker or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Assets</option>
              <option value="cash">Cash Only</option>
              <option value="security">Securities Only</option>
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
            <span className="text-gray-500">Loading holdings...</span>
          </div>
        ) : processedHoldings.length === 0 ? (
          <div className="text-center py-12">
            <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {holdings.length === 0 ? 'No holdings found' : 'No holdings match your filters'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('ticker')}
                >
                  <div className="flex items-center">
                    Ticker
                    {getSortIcon('ticker')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    {getSortIcon('name')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('instrumentType')}
                >
                  <div className="flex items-center">
                    Type
                    {getSortIcon('instrumentType')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('units')}
                >
                  <div className="flex items-center justify-end">
                    Units
                    {getSortIcon('units')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center justify-end">
                    Price
                    {getSortIcon('price')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  FX Rate
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('valueGBP')}
                >
                  <div className="flex items-center justify-end">
                    Value (GBP)
                    {getSortIcon('valueGBP')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                             {processedHoldings.map((holding, index) => (
                 <tr
                   key={`${holding.instrumentId}-${index}`}
                   className="hover:bg-gray-50"
                 >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        holding.instrumentType.toLowerCase() === 'cash'
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-900">
                        {holding.ticker}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={holding.name}>
                      {holding.name}
                    </div>
                    <div className="text-xs text-gray-500">{holding.currency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      holding.instrumentType.toLowerCase() === 'cash'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {holding.instrumentType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {holding.units.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {holding.instrumentType.toLowerCase() === 'cash'
                      ? '1.00'
                      : `${formatCurrency(holding.price)} ${holding.currency}`
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {holding.fxRate ? holding.fxRate.toFixed(4) : '1.0000'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {formatCurrency(holding.valueGBP)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HoldingsTable;
