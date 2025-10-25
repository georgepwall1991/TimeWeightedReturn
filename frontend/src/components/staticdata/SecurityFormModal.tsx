import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { InstrumentDto, AssetClass, PriceSource } from '../../types/instrument';

interface SecurityFormModalProps {
  security: InstrumentDto | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const ASSET_CLASSES: AssetClass[] = ['Equity', 'Bond', 'Commodity', 'Currency', 'RealEstate', 'Alternative', 'Cash'];
const PRICE_SOURCES: PriceSource[] = ['Manual', 'AlphaVantage', 'Finnhub', 'YahooFinance'];

export default function SecurityFormModal({ security, onClose, onSave }: SecurityFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    ticker: '',
    name: '',
    currency: 'GBP',
    type: 'Security' as const,
    isin: '',
    sedol: '',
    cusip: '',
    assetClass: '' as AssetClass | '',
    sector: '',
    exchange: '',
    country: '',
    preferredDataProvider: '' as PriceSource | '',
    dataProviderConfig: '',
  });

  useEffect(() => {
    if (security) {
      setFormData({
        ticker: security.ticker,
        name: security.name,
        currency: security.currency,
        type: 'Security',
        isin: security.isin || '',
        sedol: security.sedol || '',
        cusip: security.cusip || '',
        assetClass: security.assetClass || '',
        sector: security.sector || '',
        exchange: security.exchange || '',
        country: security.country || '',
        preferredDataProvider: security.preferredDataProvider || '',
        dataProviderConfig: security.dataProviderConfig || '',
      });
    }
  }, [security]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Clean up the data - convert empty strings to null for optional fields
      const cleanedData = {
        ...formData,
        isin: formData.isin || null,
        sedol: formData.sedol || null,
        cusip: formData.cusip || null,
        assetClass: formData.assetClass || null,
        sector: formData.sector || null,
        exchange: formData.exchange || null,
        country: formData.country || null,
        preferredDataProvider: formData.preferredDataProvider || null,
        dataProviderConfig: formData.dataProviderConfig || null,
      };

      await onSave(cleanedData);
    } catch (error) {
      // Error is handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {security ? 'Edit Security' : 'New Security'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="px-6 py-4 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticker <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="AAPL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="USD"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Apple Inc."
                  />
                </div>
              </div>
            </div>

            {/* Identifiers */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Identifiers</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISIN</label>
                  <input
                    type="text"
                    value={formData.isin}
                    onChange={(e) => setFormData({ ...formData, isin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="US0378331005"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEDOL</label>
                  <input
                    type="text"
                    value={formData.sedol}
                    onChange={(e) => setFormData({ ...formData, sedol: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="2046251"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CUSIP</label>
                  <input
                    type="text"
                    value={formData.cusip}
                    onChange={(e) => setFormData({ ...formData, cusip: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="037833100"
                  />
                </div>
              </div>
            </div>

            {/* Classification */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Classification</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Class</label>
                  <select
                    value={formData.assetClass}
                    onChange={(e) => setFormData({ ...formData, assetClass: e.target.value as AssetClass | '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select asset class...</option>
                    {ASSET_CLASSES.map((ac) => (
                      <option key={ac} value={ac}>
                        {ac}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                  <input
                    type="text"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Technology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exchange</label>
                  <input
                    type="text"
                    value={formData.exchange}
                    onChange={(e) => setFormData({ ...formData, exchange: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="NASDAQ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            {/* Data Provider Settings */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Data Provider Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Data Provider
                  </label>
                  <select
                    value={formData.preferredDataProvider}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredDataProvider: e.target.value as PriceSource | '' })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Use system default...</option>
                    {PRICE_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider Configuration (JSON)
                  </label>
                  <textarea
                    value={formData.dataProviderConfig}
                    onChange={(e) => setFormData({ ...formData, dataProviderConfig: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder='{"symbol": "AAPL", "adjustForDividends": true}'
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Optional JSON configuration for provider-specific settings
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{security ? 'Update Security' : 'Create Security'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
