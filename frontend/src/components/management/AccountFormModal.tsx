import { useState } from 'react';
import { X } from 'lucide-react';
import { useGetPortfoliosQuery } from '../../services/api';

interface AccountFormModalProps {
  account: any | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function AccountFormModal({ account, onClose, onSave }: AccountFormModalProps) {
  const [name, setName] = useState(account?.name || '');
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber || '');
  const [currency, setCurrency] = useState(account?.currency || 'GBP');
  const [portfolioId, setPortfolioId] = useState(account?.portfolioId || '');
  const [isLoading, setIsLoading] = useState(false);

  const { data: portfolios = [], isLoading: portfoliosLoading } = useGetPortfoliosQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave({ id: account?.id, name, accountNumber, currency, portfolioId });
    } finally {
      setIsLoading(false);
    }
  };

  const currencies = ['GBP', 'USD', 'EUR', 'JPY', 'CHF', 'CAD', 'AUD'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {account ? 'Edit Account' : 'New Account'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter account name"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter account number"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency *
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isLoading}
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio *
                </label>
                <select
                  value={portfolioId}
                  onChange={(e) => setPortfolioId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isLoading || portfoliosLoading || account !== null}
                >
                  <option value="">Select a portfolio...</option>
                  {portfolios.map((portfolio) => (
                    <option key={portfolio.id} value={portfolio.id}>
                      {portfolio.clientName} - {portfolio.name}
                    </option>
                  ))}
                </select>
                {account && (
                  <p className="mt-1 text-xs text-gray-500">
                    Portfolio cannot be changed after creation
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim() || !accountNumber.trim() || !portfolioId}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : account ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
