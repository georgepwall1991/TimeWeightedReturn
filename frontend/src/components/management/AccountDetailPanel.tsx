import { useState } from 'react';
import { Plus, Wallet, TrendingUp, Receipt, Edit, Info, Loader2, Calendar } from 'lucide-react';
import TransactionList from './TransactionList';
import TransactionFormModal from './TransactionFormModal';
import {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetAccountHoldingsQuery,
} from '../../services/api';
import type { AccountDto } from '../../types/management';
import type { TransactionDto, CreateTransactionRequest } from '../../types/transaction';

interface AccountDetailPanelProps {
  account: AccountDto;
  onEdit: () => void;
}

type TabType = 'overview' | 'holdings' | 'transactions';

export default function AccountDetailPanel({ account, onEdit }: AccountDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionDto | null>(null);

  // Fetch transactions from API
  const { data: transactions = [] } = useGetTransactionsQuery({
    accountId: account.id,
  });
  const [createTransaction] = useCreateTransactionMutation();
  const [updateTransaction] = useUpdateTransactionMutation();
  const [deleteTransaction] = useDeleteTransactionMutation();

  // Fetch holdings to get accurate count for badge
  const date = new Date().toISOString().split('T')[0];
  const { data: holdingsData } = useGetAccountHoldingsQuery({
    accountId: account.id,
    date,
  });
  const actualHoldingsCount = holdingsData?.holdings?.length ?? account.holdingCount;

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowTransactionModal(true);
  };

  const handleEditTransaction = (transaction: TransactionDto) => {
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleDeleteTransaction = async (transaction: TransactionDto) => {
    if (
      window.confirm(
        `Are you sure you want to delete this transaction?\n\n${transaction.description}`
      )
    ) {
      try {
        await deleteTransaction({
          transactionId: transaction.id,
          accountId: account.id,
        }).unwrap();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  };

  const handleSaveTransaction = async (data: CreateTransactionRequest) => {
    try {
      if (editingTransaction) {
        // Update existing transaction
        await updateTransaction({
          transactionId: editingTransaction.id,
          body: {
            date: data.date,
            amount: data.amount,
            description: data.description,
            type: data.type,
            transactionReference: data.transactionReference,
          },
        }).unwrap();
      } else {
        // Create new transaction
        await createTransaction(data).unwrap();
      }
      setShowTransactionModal(false);
    } catch (error) {
      console.error('Failed to save transaction:', error);
      throw error; // Re-throw so modal can show loading state
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Wallet className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">{account.name}</h2>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Account #{account.accountNumber}</span>
              <span>•</span>
              <span>{account.currency}</span>
              <span>•</span>
              <span>{account.portfolioName}</span>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Account</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 px-6">
        <nav className="-mb-px flex space-x-6">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<Info className="w-4 h-4" />}
            label="Overview"
          />
          <TabButton
            active={activeTab === 'holdings'}
            onClick={() => setActiveTab('holdings')}
            icon={<TrendingUp className="w-4 h-4" />}
            label="Holdings"
            badge={actualHoldingsCount}
          />
          <TabButton
            active={activeTab === 'transactions'}
            onClick={() => setActiveTab('transactions')}
            icon={<Receipt className="w-4 h-4" />}
            label="Transactions"
            badge={transactions.length}
          />
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <OverviewTab account={account} holdingsCount={actualHoldingsCount} />
        )}
        {activeTab === 'holdings' && <HoldingsTab account={account} />}
        {activeTab === 'transactions' && (
          <TransactionsTab
            transactions={transactions}
            onAdd={handleAddTransaction}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        )}
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <TransactionFormModal
          accountId={account.id}
          transaction={editingTransaction}
          onClose={() => setShowTransactionModal(false)}
          onSave={handleSaveTransaction}
        />
      )}
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

function TabButton({ active, onClick, icon, label, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${
        active
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      } flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={`${
            active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          } px-2 py-0.5 text-xs rounded-full`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function OverviewTab({ account, holdingsCount }: { account: AccountDto; holdingsCount: number }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Account Name</div>
            <div className="text-base font-medium text-gray-900">{account.name}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Account Number</div>
            <div className="text-base font-medium text-gray-900">{account.accountNumber}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Currency</div>
            <div className="text-base font-medium text-gray-900">{account.currency}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Portfolio</div>
            <div className="text-base font-medium text-gray-900">{account.portfolioName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Client</div>
            <div className="text-base font-medium text-gray-900">{account.clientName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Created</div>
            <div className="text-base font-medium text-gray-900">
              {new Date(account.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Holdings</div>
              <div className="text-2xl font-semibold text-gray-900">{holdingsCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Transactions</div>
              <div className="text-2xl font-semibold text-gray-900">{account.cashFlowCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HoldingsTab({ account }: { account: AccountDto }) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: holdingsData, isLoading, error, isFetching } = useGetAccountHoldingsQuery({
    accountId: account.id,
    date,
  });

  const handleAddSecurity = () => {
    // TODO: Implement add security functionality
    console.log('Add security for account:', account.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading holdings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load holdings. Please try again later.</p>
      </div>
    );
  }

  const holdings = holdingsData?.holdings || [];
  const totalValue = holdingsData?.totalValueGBP || 0;

  return (
    <div className="space-y-4">
      {/* Date Picker and Summary Card */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        {/* Date Picker */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <label htmlFor="holdings-date" className="text-sm text-gray-600">
              As of:
            </label>
            <input
              id="holdings-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* Summary Stats */}
        {holdings.length > 0 && (
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Value</div>
              <div className="text-2xl font-bold text-gray-900">
                £{totalValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Holdings</div>
              <div className="text-2xl font-bold text-gray-900">{holdings.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Selected Date</div>
              <div className="text-lg font-semibold text-gray-900">
                {new Date(date).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <span>Securities</span>
          {isFetching && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
        </h3>
        <button
          onClick={handleAddSecurity}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Security</span>
        </button>
      </div>

      {holdings.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No holdings in this account yet</p>
          <button
            onClick={handleAddSecurity}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Security</span>
          </button>
        </div>
      ) : (
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
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value (GBP)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % of Portfolio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {holdings.map((holding) => (
                  <tr key={holding.instrumentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{holding.ticker}</div>
                      <div className="text-sm text-gray-500">{holding.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {holding.units.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {holding.currency} {holding.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        £{holding.valueGBP.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="text-sm text-gray-900">
                          {((holding.valueGBP / totalValue) * 100).toFixed(2)}%
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min((holding.valueGBP / totalValue) * 100, 100)}%`,
                            }}
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
      )}
    </div>
  );
}

interface TransactionsTabProps {
  transactions: TransactionDto[];
  onAdd: () => void;
  onEdit: (transaction: TransactionDto) => void;
  onDelete: (transaction: TransactionDto) => void;
}

function TransactionsTab({ transactions, onAdd, onEdit, onDelete }: TransactionsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No transactions recorded yet</p>
          <button
            onClick={onAdd}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Transaction</span>
          </button>
        </div>
      ) : (
        <TransactionList transactions={transactions} onEdit={onEdit} onDelete={onDelete} />
      )}
    </div>
  );
}
