import React, { useState } from 'react';
import { useGetAccountHoldingsQuery, useGetPortfolioTreeQuery } from '../../services/api';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import ContributionDashboard from './ContributionDashboard';

const TestHoldings: React.FC = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Get portfolio tree to find available accounts
  const { data: treeData, isLoading: treeLoading } = useGetPortfolioTreeQuery({});

  // Get holdings for selected account
  const {
    data: holdingsData,
    isLoading: holdingsLoading,
    error: holdingsError
  } = useGetAccountHoldingsQuery(
    { accountId: selectedAccountId, date: selectedDate },
    { skip: !selectedAccountId }
  );

  // Extract all accounts from tree data
  const availableAccounts = React.useMemo(() => {
    if (!treeData?.clients) return [];

    const accounts: Array<{ id: string; name: string; portfolioName: string; clientName: string }> = [];

    treeData.clients.forEach(client => {
      client.portfolios.forEach(portfolio => {
        portfolio.accounts.forEach(account => {
          accounts.push({
            id: account.id,
            name: account.name,
            portfolioName: portfolio.name,
            clientName: client.name
          });
        });
      });
    });

    return accounts;
  }, [treeData]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Test Account Holdings</h2>

        {/* Account Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Account
            </label>
            {treeLoading ? (
              <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
            ) : (
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose an account...</option>
                {availableAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.clientName} → {account.portfolioName} → {account.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Holdings Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Holdings Display */}
        {selectedAccountId && (
          <div className="space-y-6">
            {holdingsLoading && (
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            )}

            {holdingsError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-600 font-medium">Error loading holdings</div>
                <div className="text-red-500 text-sm mt-1">
                  {'data' in holdingsError ?
                    JSON.stringify(holdingsError.data) :
                    'Failed to fetch holdings data'
                  }
                </div>
              </div>
            )}

            {holdingsData && (
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {holdingsData.accountName}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>Date: {holdingsData.date}</span>
                    <span>Holdings: {holdingsData.count}</span>
                    <span>Total Value: {formatCurrency(holdingsData.totalValueGBP)}</span>
                  </div>
                </div>

                {/* Holdings Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Ticker
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Units
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Price
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Value (GBP)
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Weight
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {holdingsData.holdings.map((holding) => {
                        const weight = holdingsData.totalValueGBP > 0
                          ? holding.valueGBP / holdingsData.totalValueGBP
                          : 0;

                        return (
                          <tr key={holding.instrumentId} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {holding.ticker}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {holding.name}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                holding.instrumentType === 'Cash'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {holding.instrumentType}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">
                              {holding.units.toLocaleString('en-GB', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 6
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">
                              {formatCurrency(holding.price)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {formatCurrency(holding.valueGBP)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-600">
                              {formatPercentage(weight)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-sm font-medium text-gray-900">
                          Total
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                          {formatCurrency(holdingsData.totalValueGBP)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          100.00%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contribution Analysis Demo */}
      {selectedAccountId && holdingsData && (
        <ContributionDashboard
          accountId={selectedAccountId}
          accountName={holdingsData.accountName}
          period="Demo Period"
          totalReturn={0.085} // Mock 8.5% return
          date={selectedDate}
        />
      )}
    </div>
  );
};

export default TestHoldings;
