import React, { useMemo } from 'react';
import { PoundSterling, BarChart3, PieChart, Briefcase } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import type { PortfolioNodeDto } from '../../types/api';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, type PieLabelRenderProps } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import RefreshPricesButton from '../marketdata/RefreshPricesButton';

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
      <div className="flex items-center justify-center py-12 bg-gradient-to-br from-white via-green-50/20 to-emerald-50/30 dark:from-gray-800 dark:via-green-950/10 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-900/30 shadow-lg">
        <div className="relative">
          <div className="animate-spin rounded-full h-8 w-8 border-t-3 border-b-3 border-green-600 dark:border-green-400"></div>
        </div>
        <span className="ml-3 font-medium bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Loading portfolio overview...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 dark:from-gray-800 dark:via-green-950/20 dark:to-emerald-950/30 rounded-xl border-2 border-green-200 dark:border-green-800/50 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">{portfolioData.name}</h2>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Portfolio Overview</p>
            </div>
          </div>
          <RefreshPricesButton size="sm" variant="secondary" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Value */}
        <div className="group bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-800 dark:via-blue-950/20 dark:to-indigo-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-900/30 shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Value</span>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <PoundSterling className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {formatCurrency(portfolioStats.totalValue)}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
            Across {portfolioStats.accountsCount} accounts
          </div>
        </div>

        {/* Total Holdings */}
        <div className="group bg-gradient-to-br from-white via-purple-50/30 to-fuchsia-50/50 dark:from-gray-800 dark:via-purple-950/20 dark:to-fuchsia-950/30 rounded-xl p-6 border border-purple-200 dark:border-purple-900/30 shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Holdings</span>
            <div className="p-2 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-lg shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            {portfolioStats.totalHoldings}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
            Instruments tracked
          </div>
        </div>

        {/* Accounts Count */}
        <div className="group bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 dark:from-gray-800 dark:via-green-950/20 dark:to-emerald-950/30 rounded-xl p-6 border border-green-200 dark:border-green-900/30 shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Accounts</span>
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {portfolioStats.accountsCount}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
            Active accounts
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Value Distribution */}
        <div className="bg-gradient-to-br from-white via-green-50/20 to-emerald-50/30 dark:from-gray-800 dark:via-green-950/10 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-900/30 p-6 shadow-lg hover:shadow-glow transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Value by Account</h3>
          </div>
          {portfolioStats.accounts.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={portfolioStats.accounts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: PieLabelRenderProps) => `${props.name}: ${formatCurrency(props.value as number)}`}
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
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No account data available
            </div>
          )}
        </div>

        {/* Account Comparison Bar Chart */}
        <div className="bg-gradient-to-br from-white via-teal-50/20 to-cyan-50/30 dark:from-gray-800 dark:via-teal-950/10 dark:to-cyan-950/20 rounded-xl border border-teal-200 dark:border-teal-900/30 p-6 shadow-lg hover:shadow-glow transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Account Comparison</h3>
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
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No account data available
            </div>
          )}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-gradient-to-br from-white via-purple-50/10 to-indigo-50/20 dark:from-gray-800 dark:via-purple-950/5 dark:to-indigo-950/10 rounded-xl border border-purple-200 dark:border-purple-900/30 p-6 shadow-lg">
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">Account Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Holdings
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  % of Portfolio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {portfolioStats.accounts.map((account, index) => (
                <tr key={account.name} className="hover:bg-gray-50 dark:bg-gray-900">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{account.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                    {formatCurrency(account.value)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                    {account.holdings}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-100">
                    {account.currency}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                    {((account.value / portfolioStats.totalValue) * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-green-50/30 dark:from-gray-800 dark:via-gray-800/50 dark:to-green-950/20 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <h3 className="text-lg font-bold bg-gradient-to-r from-gray-700 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">Portfolio Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Portfolio Name</div>
            <div className="text-sm font-medium text-gray-900 truncate">{portfolioData.name}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Accounts</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{portfolioStats.accountsCount}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Value</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(portfolioStats.totalValue)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Holdings</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{portfolioStats.totalHoldings}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;
