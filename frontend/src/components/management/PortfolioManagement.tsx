import { useState } from 'react';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import PortfolioFormModal from './PortfolioFormModal';
import {
  useGetPortfoliosQuery,
  useCreatePortfolioMutation,
  useUpdatePortfolioMutation,
  useDeletePortfolioMutation,
} from '../../services/api';
import type { PortfolioDto } from '../../types/management';

export default function PortfolioManagement() {
  const { data: portfolios = [], isLoading, error } = useGetPortfoliosQuery();
  const [createPortfolio] = useCreatePortfolioMutation();
  const [updatePortfolio] = useUpdatePortfolioMutation();
  const [deletePortfolio] = useDeletePortfolioMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioDto | null>(null);

  const handleCreate = () => {
    setEditingPortfolio(null);
    setShowModal(true);
  };

  const handleEdit = (portfolio: PortfolioDto) => {
    setEditingPortfolio(portfolio);
    setShowModal(true);
  };

  const handleDelete = async (portfolio: PortfolioDto) => {
    if (window.confirm(`Are you sure you want to delete "${portfolio.name}"? This will also delete all associated accounts.`)) {
      try {
        await deletePortfolio({ portfolioId: portfolio.id }).unwrap();
      } catch (error) {
        console.error('Failed to delete portfolio:', error);
        alert('Failed to delete portfolio. Please try again.');
      }
    }
  };

  const handleSave = async (portfolioData: { id?: string; name: string; clientId: string }) => {
    try {
      if (portfolioData.id) {
        // Update existing portfolio
        await updatePortfolio({
          portfolioId: portfolioData.id,
          body: { name: portfolioData.name }
        }).unwrap();
      } else {
        // Create new portfolio
        await createPortfolio({
          name: portfolioData.name,
          clientId: portfolioData.clientId
        }).unwrap();
      }
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save portfolio:', error);
      throw error; // Re-throw so modal can show loading state
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading portfolios...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load portfolios. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Portfolios</h2>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Portfolio</span>
        </button>
      </div>

      {/* Portfolios Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {portfolios.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No portfolios yet</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Portfolio</span>
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accounts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {portfolios.map((portfolio) => (
                <tr key={portfolio.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{portfolio.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{portfolio.clientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{portfolio.accountCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(portfolio.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(portfolio)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(portfolio)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <PortfolioFormModal
          portfolio={editingPortfolio}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
