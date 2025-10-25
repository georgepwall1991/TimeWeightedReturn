import { useState, useMemo } from 'react';
import { Filter, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import {
  CashFlowCategory,
  transactionTypeMetadata,
  getCategoryInfo,
} from '../../types/transaction';
import type { TransactionDto } from '../../types/transaction';

interface TransactionListProps {
  transactions: TransactionDto[];
  onEdit: (transaction: TransactionDto) => void;
  onDelete: (transaction: TransactionDto) => void;
}

type SortField = 'date' | 'amount' | 'type';
type SortDirection = 'asc' | 'desc';

export default function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const [filterCategory, setFilterCategory] = useState<CashFlowCategory | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((t) => {
        const typeInfo = transactionTypeMetadata[t.type];
        return typeInfo?.category === filterCategory;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'type':
          comparison = a.type - b.type;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, filterCategory, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filterCategory === 'all'
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilterCategory(CashFlowCategory.PerformanceInfluencing)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filterCategory === CashFlowCategory.PerformanceInfluencing
                  ? 'bg-green-100 text-green-800 font-medium border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setFilterCategory(CashFlowCategory.ExternalFlow)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filterCategory === CashFlowCategory.ExternalFlow
                  ? 'bg-red-100 text-red-800 font-medium border border-red-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              External Flow
            </button>
            <button
              onClick={() => setFilterCategory(CashFlowCategory.Internal)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filterCategory === CashFlowCategory.Internal
                  ? 'bg-gray-200 text-gray-800 font-medium border border-gray-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Internal
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            {filterCategory === 'all'
              ? 'No transactions yet'
              : 'No transactions in this category'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => toggleSort('date')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    {sortField === 'date' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('type')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Type</span>
                    {sortField === 'type' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th
                  onClick={() => toggleSort('amount')}
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Amount</span>
                    {sortField === 'amount' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impact
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => {
                const typeInfo = transactionTypeMetadata[transaction.type];
                const categoryInfo = getCategoryInfo(transaction.category);

                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{typeInfo?.icon}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {typeInfo?.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="max-w-md truncate">{transaction.description}</div>
                      {transaction.transactionReference && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          Ref: {transaction.transactionReference}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span
                        className={`text-sm font-medium ${
                          transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full border ${categoryInfo.badgeColor}`}
                      >
                        {categoryInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => onEdit(transaction)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Edit transaction"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => onDelete(transaction)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
