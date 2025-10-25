import { useState } from 'react';
import { useGetReconciliationBreaksQuery } from '../../services/api';
import { ReconciliationStatus, ReconciliationBreakType } from '../../types/reconciliation';
import BreakResolutionModal from './BreakResolutionModal';
import { format } from 'date-fns';

export default function BreaksList() {
  const { data: breaks, isLoading, error } = useGetReconciliationBreaksQuery({
    status: ReconciliationStatus.Break,
  });
  const [selectedBreakId, setSelectedBreakId] = useState<string | null>(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);

  const getBreakTypeColor = (breakType: ReconciliationBreakType) => {
    switch (breakType) {
      case ReconciliationBreakType.MissingTransaction:
        return 'bg-red-100 text-red-800';
      case ReconciliationBreakType.QuantityMismatch:
        return 'bg-orange-100 text-orange-800';
      case ReconciliationBreakType.AmountMismatch:
        return 'bg-yellow-100 text-yellow-800';
      case ReconciliationBreakType.PriceDifference:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBreakTypeName = (breakType: ReconciliationBreakType) => {
    return ReconciliationBreakType[breakType] || 'Unknown';
  };

  const handleResolveBreak = (breakId: string) => {
    setSelectedBreakId(breakId);
    setShowResolutionModal(true);
  };

  const handleExportBreaks = () => {
    const baseUrl = 'http://localhost:5011'; // TODO: Get from env config
    window.open(`${baseUrl}/api/reconciliation/breaks/export?status=5`, '_blank'); // Status 5 = Break
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading breaks...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load breaks</p>
      </div>
    );
  }

  if (!breaks || breaks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-green-600 mb-2">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-gray-900 font-medium">No Unresolved Breaks</p>
        <p className="text-gray-500 text-sm mt-1">All reconciliation breaks have been resolved</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Export Button */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Unresolved Breaks</h3>
          <button
            onClick={handleExportBreaks}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export to CSV</span>
          </button>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actual
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {breaks.map((breakItem) => (
              <tr key={breakItem.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBreakTypeColor(breakItem.breakType)}`}>
                    {getBreakTypeName(breakItem.breakType)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {breakItem.entityType}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {breakItem.description}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {breakItem.expectedValue || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {breakItem.actualValue || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  {breakItem.variance !== null && breakItem.variance !== undefined ? (
                    <span className={`font-medium ${breakItem.variance !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {breakItem.variance > 0 ? '+' : ''}£{breakItem.variance.toFixed(2)}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {breakItem.breakDate ? format(new Date(breakItem.breakDate), 'MMM dd, yyyy') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleResolveBreak(breakItem.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Resolve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showResolutionModal && selectedBreakId && (
        <BreakResolutionModal
          breakId={selectedBreakId}
          onClose={() => {
            setShowResolutionModal(false);
            setSelectedBreakId(null);
          }}
        />
      )}
    </>
  );
}
