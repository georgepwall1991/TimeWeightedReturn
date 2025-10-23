import React, { useMemo } from 'react';
import { DollarSign, BarChart3, PieChart, Briefcase } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import type { PortfolioNodeDto } from '../../types/api';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

interface PortfolioOverviewProps {
  portfolioId: string;
  portfolioData: PortfolioNodeDto;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ portfolioId, portfolioData }) => {
  // Fetch the full tree to get all account details
  const { data: treeData } = api.useGetPortfolioTreeQuery({});

  // Find the portfolio in the tree and aggregate data
  const portfolioStats = useMemo(() => {
    if (!treeData) return null;

    // Find the portfolio
    for (const client of treeData.clients) {
      for (const portfolio of client.portfolios) {
        if (portfolio.id === portfolioId) {
          // Aggregate account data
          const accounts = portfolio.accounts || [];
          const totalValue = accounts.reduce((sum, acc) => sum + acc.totalValueGBP, 0);
          const totalHoldings = accounts.reduce((sum, acc) => sum + acc.holdingsCount, 0);

          // Group by account for comparison
          const accountComparison = accounts.map(acc => ({
            name: acc.name,
            value: acc.totalValueGBP,
            holdings: acc.holdingsCount,
            currency: acc.currency,
          }));

          return {
            totalValue,
            totalHoldings,
            accountsCount: accounts.length,
            accounts: accountComparison,
            portfolio,
          };
        }
      }
    }
    return null;
  }, [treeData, portfolioId]);

  if (!portfolioStats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Loading portfolio overview...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Briefcase className="w-8 h-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-green-900">{portfolioData.name}</h2>
            <p className="text-sm text-green-700">Portfolio Overview</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Value */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Total Value</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(portfolioStats.totalValue)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Across {portfolioStats.accountsCount} accounts
          </div>
        </div>

        {/* Total Holdings */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">Total Holdings</span>
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {portfolioStats.totalHoldings}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Instruments tracked
          </div>
        </div>

        {/* Accounts Count */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Accounts</span>
            <Briefcase className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">
            {portfolioStats.accountsCount}
          </div>
          <div className="text-xs text-green-600 mt-1">
            Active accounts
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Value Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Value by Account</h3>
          </div>
          {portfolioStats.accounts.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={portfolioStats.accounts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {portfolioStats.accounts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No account data available
            </div>
          )}
        </div>

        {/* Account Comparison Bar Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Account Comparison</h3>
          </div>
          {portfolioStats.accounts.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={portfolioStats.accounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                  tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                />
                <RechartsTooltip
                  formatter={(value: number) => [formatCurrency(value), 'Value']}
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No account data available
            </div>
          )}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Holdings
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Portfolio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {portfolioStats.accounts.map((account, index) => (
                <tr key={account.name} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-gray-900">{account.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(account.value)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                    {account.holdings}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                    {account.currency}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                    {((account.value / portfolioStats.totalValue) * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Portfolio Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-600">Portfolio Name</div>
            <div className="text-sm font-medium text-gray-900 truncate">{portfolioData.name}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Total Accounts</div>
            <div className="text-sm font-medium text-gray-900">{portfolioStats.accountsCount}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Total Value</div>
            <div className="text-sm font-medium text-gray-900">{formatCurrency(portfolioStats.totalValue)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Total Holdings</div>
            <div className="text-sm font-medium text-gray-900">{portfolioStats.totalHoldings}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;
