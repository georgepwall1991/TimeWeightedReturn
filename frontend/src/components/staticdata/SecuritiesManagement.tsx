import { useState } from 'react';
import { Plus, Edit, Trash2, Loader2, Search } from 'lucide-react';
import {
  useGetInstrumentsQuery,
  useCreateInstrumentMutation,
  useUpdateInstrumentMutation,
  useDeleteInstrumentMutation,
} from '../../services/api';
import type { InstrumentDto } from '../../types/instrument';
import SecurityFormModal from './SecurityFormModal';

export default function SecuritiesManagement() {
  const { data: instruments = [], isLoading, error } = useGetInstrumentsQuery();
  const [createInstrument] = useCreateInstrumentMutation();
  const [updateInstrument] = useUpdateInstrumentMutation();
  const [deleteInstrument] = useDeleteInstrumentMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<InstrumentDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter out Cash instruments and apply search
  const securities = instruments
    .filter((i) => i.type === 'Security')
    .filter(
      (i) =>
        i.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.isin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.sedol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.cusip?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleCreate = () => {
    setEditingInstrument(null);
    setShowModal(true);
  };

  const handleEdit = (instrument: InstrumentDto) => {
    setEditingInstrument(instrument);
    setShowModal(true);
  };

  const handleDelete = async (instrument: InstrumentDto) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${instrument.ticker} - ${instrument.name}"?\n\nThis action cannot be undone.`
      )
    ) {
      try {
        await deleteInstrument({ instrumentId: instrument.id }).unwrap();
      } catch (error: any) {
        console.error('Failed to delete security:', error);
        const errorMessage = error?.data?.message || 'Failed to delete security. It may be in use by holdings.';
        alert(errorMessage);
      }
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingInstrument) {
        await updateInstrument({
          instrumentId: editingInstrument.id,
          body: data,
        }).unwrap();
      } else {
        await createInstrument(data).unwrap();
      }
      setShowModal(false);
    } catch (error: any) {
      console.error('Failed to save security:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading securities...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load securities. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header with Search and Create Button */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticker, name, ISIN, SEDOL, or CUSIP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Security</span>
        </button>
      </div>

      {/* Securities Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {securities.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No securities found matching your search' : 'No securities yet'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Security</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Identifiers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {securities.map((security) => (
                  <tr key={security.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{security.ticker}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{security.name}</div>
                      {security.sector && (
                        <div className="text-xs text-gray-500">{security.sector}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        {security.isin && (
                          <div className="text-gray-600">
                            <span className="font-semibold">ISIN:</span> {security.isin}
                          </div>
                        )}
                        {security.sedol && (
                          <div className="text-gray-600">
                            <span className="font-semibold">SEDOL:</span> {security.sedol}
                          </div>
                        )}
                        {security.cusip && (
                          <div className="text-gray-600">
                            <span className="font-semibold">CUSIP:</span> {security.cusip}
                          </div>
                        )}
                        {!security.isin && !security.sedol && !security.cusip && (
                          <span className="text-gray-400">No identifiers</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {security.assetClass ? (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {security.assetClass}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{security.currency}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(security)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(security)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <SecurityFormModal
          security={editingInstrument}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
