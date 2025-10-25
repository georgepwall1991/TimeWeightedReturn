import React, { useMemo } from 'react';
import { User, PoundSterling, BarChart3, PieChart, Briefcase, Building } from 'lucide-react';
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
      <div className="flex items-center justify-center py-12 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 dark:from-gray-800 dark:via-blue-950/10 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-900/30 shadow-lg">
        <div className="relative">
          <div className="animate-spin rounded-full h-8 w-8 border-t-3 border-b-3 border-blue-600 dark:border-blue-400"></div>
        </div>
        <span className="ml-3 font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Loading client overview...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-800 dark:via-blue-950/20 dark:to-indigo-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-800/50 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">{clientData.name}</h2>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Client Overview</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="group bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 dark:from-gray-800 dark:via-green-950/20 dark:to-emerald-950/30 rounded-xl p-6 border border-green-200 dark:border-green-900/30 shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Value</span>
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
              <PoundSterling className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {formatCurrency(clientStats.totalValue)}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
            All portfolios
          </div>
        </div>

        {/* Portfolios */}
        <div className="group bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-800 dark:via-blue-950/20 dark:to-indigo-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-900/30 shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Portfolios</span>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {clientStats.portfoliosCount}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
            Active portfolios
          </div>
        </div>

        {/* Accounts */}
        <div className="group bg-gradient-to-br from-white via-purple-50/30 to-fuchsia-50/50 dark:from-gray-800 dark:via-purple-950/20 dark:to-fuchsia-950/30 rounded-xl p-6 border border-purple-200 dark:border-purple-900/30 shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Accounts</span>
            <div className="p-2 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-lg shadow-lg">
              <Building className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            {clientStats.totalAccounts}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
            Total accounts
          </div>
        </div>

        {/* Holdings */}
        <div className="group bg-gradient-to-br from-white via-orange-50/30 to-amber-50/50 dark:from-gray-800 dark:via-orange-950/20 dark:to-amber-950/30 rounded-xl p-6 border border-orange-200 dark:border-orange-900/30 shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Holdings</span>
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            {clientStats.totalHoldings}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
            Total instruments
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Value Distribution */}
        <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 dark:from-gray-800 dark:via-blue-950/10 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-900/30 p-6 shadow-lg hover:shadow-glow transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Value by Portfolio</h3>
          </div>
          {clientStats.portfolios.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={clientStats.portfolios}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(props: PieLabelRenderProps) => {
                    const percent = ((props.value as number / clientStats.totalValue) * 100).toFixed(1);
                    return `${percent}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {clientStats.portfolios.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '8px 12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value: string, entry: any) => {
                    const portfolioValue = entry.payload.value;
                    return `${value} (${formatCurrency(portfolioValue)})`;
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No portfolio data available
            </div>
          )}
        </div>

        {/* Portfolio Comparison Bar Chart */}
        <div className="bg-gradient-to-br from-white via-purple-50/20 to-fuchsia-50/30 dark:from-gray-800 dark:via-purple-950/10 dark:to-fuchsia-950/20 rounded-xl border border-purple-200 dark:border-purple-900/30 p-6 shadow-lg hover:shadow-glow transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-lg shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Portfolio Comparison</h3>
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
      <div className="bg-gradient-to-br from-white via-green-50/10 to-emerald-50/20 dark:from-gray-800 dark:via-green-950/5 dark:to-emerald-950/10 rounded-xl border border-green-200 dark:border-green-900/30 p-6 shadow-lg">
        <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">Portfolio Details</h3>
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
      <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50/30 dark:from-gray-800 dark:via-gray-800/50 dark:to-blue-950/20 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <h3 className="text-lg font-bold bg-gradient-to-r from-gray-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">Client Summary</h3>
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
