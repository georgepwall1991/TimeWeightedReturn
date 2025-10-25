import { useState, useMemo } from 'react';
import { Loader2, TrendingUp, Calendar } from 'lucide-react';
import { useGetAccountsQuery, useGetAccountHoldingsQuery } from '../../services/api';
import type { HoldingDto } from '../../types/api';

interface ClientHoldingsViewProps {
  clientName: string;
}

interface AggregatedHolding {
  instrumentId: string;
  ticker: string;
  name: string;
  totalUnits: number;
  averagePrice: number;
  totalValueGBP: number;
  currency: string;
  instrumentType: string;
  percentage: number;
}

export default function ClientHoldingsView({ clientName }: ClientHoldingsViewProps) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Fetch all accounts for this client
  const { data: accounts = [], isLoading: accountsLoading } = useGetAccountsQuery();

  // Filter to get only this client's accounts
  const clientAccounts = accounts.filter(acc => acc.clientName === clientName);

  // Fetch holdings for each account
  const accountHoldingsQueries = clientAccounts.map(account =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useGetAccountHoldingsQuery({ accountId: account.id, date })
  );

  const isLoadingHoldings = accountHoldingsQueries.some(query => query.isLoading);
  const hasError = accountHoldingsQueries.some(query => query.error);

  // Aggregate holdings across all accounts
  const aggregatedHoldings: AggregatedHolding[] = useMemo(() => {
    const holdingsMap = new Map<string, AggregatedHolding>();

    accountHoldingsQueries.forEach((query) => {
      if (query.data?.holdings) {
        query.data.holdings.forEach((holding: HoldingDto) => {
          const existing = holdingsMap.get(holding.instrumentId);

          if (existing) {
            // Update existing - weighted average price and total units
            const totalValue = existing.totalUnits * existing.averagePrice + holding.units * holding.price;
            const newTotalUnits = existing.totalUnits + holding.units;
            existing.totalUnits = newTotalUnits;
            existing.averagePrice = newTotalUnits > 0 ? totalValue / newTotalUnits : 0;
            existing.totalValueGBP += holding.valueGBP;
          } else {
            // New entry
            holdingsMap.set(holding.instrumentId, {
              instrumentId: holding.instrumentId,
              ticker: holding.ticker,
              name: holding.name,
              totalUnits: holding.units,
              averagePrice: holding.price,
              totalValueGBP: holding.valueGBP,
              currency: holding.currency,
              instrumentType: holding.instrumentType,
              percentage: 0, // Will calculate after aggregation
            });
          }
        });
      }
    });

    // Calculate percentages
    const totalValue = Array.from(holdingsMap.values()).reduce(
      (sum, h) => sum + h.totalValueGBP,
      0
    );

    holdingsMap.forEach((holding) => {
      holding.percentage = totalValue > 0 ? (holding.totalValueGBP / totalValue) * 100 : 0;
    });

    return Array.from(holdingsMap.values()).sort((a, b) => b.totalValueGBP - a.totalValueGBP);
  }, [accountHoldingsQueries]);

  const totalValue = aggregatedHoldings.reduce((sum, h) => sum + h.totalValueGBP, 0);

  if (accountsLoading || isLoadingHoldings) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading client holdings...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load holdings. Please try again later.</p>
      </div>
    );
  }

  if (clientAccounts.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No accounts found for this client</p>
      </div>
    );
  }

  if (aggregatedHoldings.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No holdings found for this client</p>
        <p className="text-xs text-gray-400 mt-2">
          Holdings are aggregated across {clientAccounts.length} account{clientAccounts.length !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        {/* Date Picker */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <label htmlFor="client-holdings-date" className="text-sm text-gray-600">
              As of:
            </label>
            <input
              id="client-holdings-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Value</div>
            <div className="text-2xl font-bold text-gray-900">
              £{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Holdings</div>
            <div className="text-2xl font-bold text-gray-900">{aggregatedHoldings.length}</div>
            <div className="text-xs text-gray-500">Across {clientAccounts.length} accounts</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Selected Date</div>
            <div className="text-lg font-semibold text-gray-900">
              {new Date(date).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Security
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Portfolio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {aggregatedHoldings.map((holding) => (
                <tr key={holding.instrumentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{holding.ticker}</div>
                    <div className="text-sm text-gray-500">{holding.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {holding.totalUnits.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {holding.currency} {holding.averagePrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      £{holding.totalValueGBP.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="text-sm text-gray-900">
                        {holding.percentage.toFixed(2)}%
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(holding.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
