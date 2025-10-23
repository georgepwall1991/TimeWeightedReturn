import React, { useMemo } from 'react';
import { User, DollarSign, BarChart3, PieChart, Briefcase, Building } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import type { ClientNodeDto } from '../../types/api';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading client overview...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-blue-900">{clientData.name}</h2>
            <p className="text-sm text-blue-700">Client Overview</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Total Value</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(clientStats.totalValue)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            All portfolios
          </div>
        </div>

        {/* Portfolios */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Portfolios</span>
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {clientStats.portfoliosCount}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Active portfolios
          </div>
        </div>

        {/* Accounts */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">Accounts</span>
            <Building className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {clientStats.totalAccounts}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Total accounts
          </div>
        </div>

        {/* Holdings */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-700">Holdings</span>
            <BarChart3 className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {clientStats.totalHoldings}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            Total instruments
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Value Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Value by Portfolio</h3>
          </div>
          {clientStats.portfolios.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={clientStats.portfolios}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
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
            <div className="flex items-center justify-center h-64 text-gray-500">
              No portfolio data available
            </div>
          )}
        </div>

        {/* Portfolio Comparison Bar Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Portfolio Comparison</h3>
          </div>
          {clientStats.portfolios.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={clientStats.portfolios}>
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
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No portfolio data available
            </div>
          )}
        </div>
      </div>

      {/* Portfolios Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Portfolio
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accounts
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Holdings
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientStats.portfolios.map((portfolio, index) => (
                <tr key={portfolio.name} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-gray-900">{portfolio.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(portfolio.value)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                    {portfolio.accounts}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                    {portfolio.holdings}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                    {((portfolio.value / clientStats.totalValue) * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Client Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-600">Client Name</div>
            <div className="text-sm font-medium text-gray-900 truncate">{clientData.name}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Total Portfolios</div>
            <div className="text-sm font-medium text-gray-900">{clientStats.portfoliosCount}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Total Value</div>
            <div className="text-sm font-medium text-gray-900">{formatCurrency(clientStats.totalValue)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Total Holdings</div>
            <div className="text-sm font-medium text-gray-900">{clientStats.totalHoldings}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientOverview;
