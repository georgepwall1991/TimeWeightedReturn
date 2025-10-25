import { useState, type FormEvent } from 'react';
import { X, AlertCircle, Info } from 'lucide-react';
import {
  CashFlowType,
  CashFlowCategory,
  transactionTypeMetadata,
  getCategoryInfo,
  getTransactionTypesByCategory,
} from '../../types/transaction';
import type { TransactionDto, CreateTransactionRequest } from '../../types/transaction';

interface TransactionFormModalProps {
  accountId: string;
  transaction?: TransactionDto | null;
  onClose: () => void;
  onSave: (data: CreateTransactionRequest) => Promise<void>;
}

export default function TransactionFormModal({
  accountId,
  transaction,
  onClose,
  onSave,
}: TransactionFormModalProps) {
  const [selectedType, setSelectedType] = useState<CashFlowType | null>(
    transaction?.type ?? null
  );
  const [date, setDate] = useState(transaction?.date.split('T')[0] ?? '');
  const [amount, setAmount] = useState(transaction?.amount.toString() ?? '');
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [transactionRef, setTransactionRef] = useState(transaction?.transactionReference ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedType) {
      setError('Please select a transaction type');
      return;
    }

    if (!date) {
      setError('Please enter a date');
      return;
    }

    if (!amount || isNaN(parseFloat(amount))) {
      setError('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        accountId,
        date,
        amount: parseFloat(amount),
        description: description.trim(),
        type: selectedType,
        transactionReference: transactionRef.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError('Failed to save transaction. Please try again.');
      setIsSubmitting(false);
    }
  };

  const selectedTypeInfo = selectedType ? transactionTypeMetadata[selectedType] : null;
  const categoryInfo = selectedTypeInfo ? getCategoryInfo(selectedTypeInfo.category) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {transaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Record a transaction for this account
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Transaction Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Transaction Type *
            </label>
            <div className="space-y-4">
              {/* Performance-Influencing Types */}
              <TransactionTypeGroup
                category={CashFlowCategory.PerformanceInfluencing}
                selectedType={selectedType}
                onSelect={setSelectedType}
              />

              {/* External Flow Types */}
              <TransactionTypeGroup
                category={CashFlowCategory.ExternalFlow}
                selectedType={selectedType}
                onSelect={setSelectedType}
              />

              {/* Internal Types */}
              <TransactionTypeGroup
                category={CashFlowCategory.Internal}
                selectedType={selectedType}
                onSelect={setSelectedType}
              />
            </div>
          </div>

          {/* Selected Type Info */}
          {selectedTypeInfo && categoryInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{selectedTypeInfo.icon}</span>
                    <span className="font-medium text-gray-900">{selectedTypeInfo.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryInfo.badgeColor}`}>
                      {categoryInfo.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{selectedTypeInfo.description}</p>
                  <p className="text-xs text-gray-600 italic">{categoryInfo.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount * (£)
            </label>
            <input
              type="number"
              id="amount"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use positive values for inflows (deposits, income) and negative for outflows (withdrawals, fees)
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a description for this transaction"
              required
            />
          </div>

          {/* Transaction Reference */}
          <div>
            <label htmlFor="transactionRef" className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Reference (Optional)
            </label>
            <input
              type="text"
              id="transactionRef"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g., TXN123456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : transaction ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TransactionTypeGroupProps {
  category: CashFlowCategory;
  selectedType: CashFlowType | null;
  onSelect: (type: CashFlowType) => void;
}

function TransactionTypeGroup({ category, selectedType, onSelect }: TransactionTypeGroupProps) {
  const types = getTransactionTypesByCategory(category);
  const categoryInfo = getCategoryInfo(category);
  const [isExpanded, setIsExpanded] = useState(category === CashFlowCategory.ExternalFlow);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-t-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${categoryInfo.badgeColor}`}>
            {categoryInfo.label}
          </span>
          <span className="text-sm text-gray-600">{types.length} types</span>
        </div>
        <span className="text-gray-400">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 pt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
          {types.map((typeInfo) => (
            <button
              key={typeInfo.type}
              type="button"
              onClick={() => onSelect(typeInfo.type)}
              className={`text-left px-3 py-2 rounded-lg border-2 transition-all ${
                selectedType === typeInfo.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-2">
                <span className="text-base mt-0.5">{typeInfo.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {typeInfo.label}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-2">
                    {typeInfo.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
