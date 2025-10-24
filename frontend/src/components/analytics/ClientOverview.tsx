import React, { useMemo } from 'react';
import { User, DollarSign, BarChart3, PieChart, Briefcase, Building } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import type { ClientNodeDto } from '../../types/api';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, type PieLabelRenderProps } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

interface ClientOverviewProps {
  clientId: string;
  clientData: ClientNodeDto;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const ClientOverview: React.FC<ClientOverviewProps> = ({ clientId, clientData }) => {
  // Fetch the full tree to get all portfolio and account details
  const { data: treeData } = api.useGetPortfolioTreeQuery({});

  // Find the client in the tree and aggregate data
  const clientStats = useMemo(() => {
    if (!treeData) return null;

    // Find the client
    for (const client of treeData.clients) {
      if (client.id === clientId) {
        const portfolios = client.portfolios || [];
        const totalValue = portfolios.reduce((sum, portfolio) => sum + portfolio.totalValueGBP, 0);
        const totalAccounts = portfolios.reduce((sum, portfolio) => sum + (portfolio.accounts?.length || 0), 0);
        const totalHoldings = portfolios.reduce((sum, portfolio) => sum + portfolio.holdingsCount, 0);

        // Group by portfolio for comparison
        const portfolioComparison = portfolios.map(portfolio => ({
          name: portfolio.name,
          value: portfolio.totalValueGBP,
          accounts: portfolio.accounts?.length || 0,
          holdings: portfolio.holdingsCount,
        }));

        // Get all accounts across all portfolios
        const allAccounts = portfolios.flatMap(p => p.accounts || []);

        return {
          totalValue,
          totalHoldings,
          totalAccounts,
          portfoliosCount: portfolios.length,
          portfolios: portfolioComparison,
          accounts: allAccounts,
          client,
        };
      }
    }
    return null;
  }, [treeData, clientId]);

  if (!clientStats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading client overview...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-300">{clientData.name}</h2>
            <p className="text-sm text-blue-700 dark:text-blue-400">Client Overview</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Total Value</span>
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-300">
            {formatCurrency(clientStats.totalValue)}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            All portfolios
          </div>
        </div>

        {/* Portfolios */}
        <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Portfolios</span>
            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-300">
            {clientStats.portfoliosCount}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Active portfolios
          </div>
        </div>

        {/* Accounts */}
        <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Accounts</span>
            <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-300">
            {clientStats.totalAccounts}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            Total accounts
          </div>
        </div>

        {/* Holdings */}
        <div className="bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Holdings</span>
            <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-900 dark:text-orange-300">
            {clientStats.totalHoldings}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            Total instruments
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Value Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Value by Portfolio</h3>
          </div>
          {clientStats.portfolios.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={clientStats.portfolios}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: PieLabelRenderProps) => `${props.name}: ${formatCurrency(props.value as number)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {clientStats.portfolios.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No portfolio data available
            </div>
          )}
        </div>

        {/* Portfolio Comparison Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Portfolio Comparison</h3>
          </div>
          {clientStats.portfolios.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={clientStats.portfolios}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                  className="dark:stroke-gray-400"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                  className="dark:stroke-gray-400"
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
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No portfolio data available
            </div>
          )}
        </div>
      </div>

      {/* Portfolios Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Portfolio Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Portfolio
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Accounts
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Holdings
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {clientStats.portfolios.map((portfolio, index) => (
                <tr key={portfolio.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{portfolio.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                    {formatCurrency(portfolio.value)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                    {portfolio.accounts}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                    {portfolio.holdings}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                    {((portfolio.value / clientStats.totalValue) * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Client Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Client Name</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{clientData.name}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Portfolios</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{clientStats.portfoliosCount}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Value</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(clientStats.totalValue)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Holdings</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{clientStats.totalHoldings}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientOverview;
