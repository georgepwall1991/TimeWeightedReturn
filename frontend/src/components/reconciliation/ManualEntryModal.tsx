import { useState } from 'react';
import { X } from 'lucide-react';

interface ManualEntryModalProps {
  entryType: 'Transactions' | 'Holdings' | 'Prices';
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function ManualEntryModal({ entryType, onClose, onSave }: ManualEntryModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>(getInitialFormData(entryType));

  function getInitialFormData(type: string) {
    switch (type) {
      case 'Transactions':
        return {
          accountCode: '',
          date: new Date().toISOString().split('T')[0],
          type: 'Buy',
          instrumentCode: '',
          quantity: '',
          price: '',
          amount: '',
          currency: 'USD',
          description: '',
        };
      case 'Holdings':
        return {
          accountCode: '',
          date: new Date().toISOString().split('T')[0],
          instrumentCode: '',
          quantity: '',
          averageCost: '',
          marketValue: '',
          currency: 'USD',
        };
      case 'Prices':
        return {
          instrumentCode: '',
          date: new Date().toISOString().split('T')[0],
          price: '',
          currency: 'USD',
        };
      default:
        return {};
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTransactionFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Account Code *</label>
        <input
          type="text"
          value={formData.accountCode}
          onChange={(e) => handleChange('accountCode', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="ACC001"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
        <select
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        >
          <option value="Buy">Buy</option>
          <option value="Sell">Sell</option>
          <option value="Dividend">Dividend</option>
          <option value="Interest">Interest</option>
          <option value="Fee">Fee</option>
          <option value="Deposit">Deposit</option>
          <option value="Withdrawal">Withdrawal</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instrument Code *</label>
        <input
          type="text"
          value={formData.instrumentCode}
          onChange={(e) => handleChange('instrumentCode', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="AAPL"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input
            type="number"
            step="0.01"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="100"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="150.50"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="15050.00"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency *</label>
          <select
            value={formData.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="EUR">EUR</option>
            <option value="JPY">JPY</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Optional transaction description"
          disabled={isLoading}
        />
      </div>
    </>
  );

  const renderHoldingFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Account Code *</label>
        <input
          type="text"
          value={formData.accountCode}
          onChange={(e) => handleChange('accountCode', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="ACC001"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instrument Code *</label>
        <input
          type="text"
          value={formData.instrumentCode}
          onChange={(e) => handleChange('instrumentCode', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="AAPL"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
        <input
          type="number"
          step="0.01"
          value={formData.quantity}
          onChange={(e) => handleChange('quantity', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="100"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Average Cost</label>
          <input
            type="number"
            step="0.01"
            value={formData.averageCost}
            onChange={(e) => handleChange('averageCost', e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="150.50"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Market Value *</label>
          <input
            type="number"
            step="0.01"
            value={formData.marketValue}
            onChange={(e) => handleChange('marketValue', e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="15500.00"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Currency *</label>
        <select
          value={formData.currency}
          onChange={(e) => handleChange('currency', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        >
          <option value="USD">USD</option>
          <option value="GBP">GBP</option>
          <option value="EUR">EUR</option>
          <option value="JPY">JPY</option>
        </select>
      </div>
    </>
  );

  const renderPriceFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instrument Code *</label>
        <input
          type="text"
          value={formData.instrumentCode}
          onChange={(e) => handleChange('instrumentCode', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="AAPL"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
        <input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => handleChange('price', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="155.00"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Currency *</label>
        <select
          value={formData.currency}
          onChange={(e) => handleChange('currency', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        >
          <option value="USD">USD</option>
          <option value="GBP">GBP</option>
          <option value="EUR">EUR</option>
          <option value="JPY">JPY</option>
        </select>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Add {entryType === 'Transactions' ? 'Transaction' : entryType === 'Holdings' ? 'Holding' : 'Price'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info Banner */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              This data will be imported as IBoR (Investment Book of Record) with status "Pending" and require reconciliation approval.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {entryType === 'Transactions' && renderTransactionFields()}
            {entryType === 'Holdings' && renderHoldingFields()}
            {entryType === 'Prices' && renderPriceFields()}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save & Create Batch'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
