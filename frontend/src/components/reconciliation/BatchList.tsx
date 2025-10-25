import { useState } from 'react';
import { useGetReconciliationBatchesQuery, useRunReconciliationMutation } from '../../services/api';
import { ReconciliationStatus } from '../../types/reconciliation';
import BatchApprovalModal from './BatchApprovalModal';
import BulkApprovalModal from './BulkApprovalModal';
import { format } from 'date-fns';

export default function BatchList() {
  const { data: batches, isLoading, error } = useGetReconciliationBatchesQuery();
  const [runReconciliation] = useRunReconciliationMutation();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [reconcilingBatchId, setReconcilingBatchId] = useState<string | null>(null);
  const [selectedBatches, setSelectedBatches] = useState<Set<string>>(new Set());
  const [showBulkApprovalModal, setShowBulkApprovalModal] = useState(false);

  const getStatusBadge = (status: ReconciliationStatus) => {
    switch (status) {
      case ReconciliationStatus.Pending:
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case ReconciliationStatus.Matched:
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Matched</span>;
      case ReconciliationStatus.Approved:
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>;
      case ReconciliationStatus.Rejected:
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
    }
  };

  const handleRunReconciliation = async (batchId: string, batchDate: string) => {
    setReconcilingBatchId(batchId);
    try {
      await runReconciliation({
        batchId,
        reconciliationDate: batchDate,
        reconciliationType: 'Full',
        useTolerance: 'standard',
      }).unwrap();
      alert('Reconciliation completed successfully!');
    } catch (error) {
      alert('Failed to run reconciliation: ' + (error as Error).message);
    } finally {
      setReconcilingBatchId(null);
    }
  };

  const handleApproveBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    setShowApprovalModal(true);
  };

  const handleExportBatches = () => {
    const baseUrl = 'http://localhost:5011'; // TODO: Get from env config
    window.open(`${baseUrl}/api/reconciliation/batches/export`, '_blank');
  };

  const handleToggleBatch = (batchId: string) => {
    setSelectedBatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(batchId)) {
        newSet.delete(batchId);
      } else {
        newSet.add(batchId);
      }
      return newSet;
    });
  };

  const handleToggleAll = () => {
    if (!batches) return;

    if (selectedBatches.size === batches.length) {
      setSelectedBatches(new Set());
    } else {
      setSelectedBatches(new Set(batches.map(b => b.id)));
    }
  };

  const handleBulkApprove = () => {
    if (selectedBatches.size === 0) {
      alert('Please select at least one batch');
      return;
    }
    setShowBulkApprovalModal(true);
  };

  const getEligibleBatchesForApproval = () => {
    if (!batches) return [];
    return batches.filter(b =>
      selectedBatches.has(b.id) &&
      (b.status === ReconciliationStatus.Matched || b.status === ReconciliationStatus.Pending)
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading batches...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load batches</p>
      </div>
    );
  }

  if (!batches || batches.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No reconciliation batches found</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header with Bulk Actions */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Reconciliation Batches</h3>
            <button
              onClick={handleExportBatches}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export to CSV</span>
            </button>
          </div>

          {/* Bulk Actions Bar */}
          {selectedBatches.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium text-blue-900">
                {selectedBatches.size} batch{selectedBatches.size > 1 ? 'es' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkApprove}
                  disabled={getEligibleBatchesForApproval().length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Bulk Approve ({getEligibleBatchesForApproval().length})
                </button>
                <button
                  onClick={() => setSelectedBatches(new Set())}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 w-12">
                <input
                  type="checkbox"
                  checked={batches && selectedBatches.size === batches.length && batches.length > 0}
                  onChange={handleToggleAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batch Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matched
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Breaks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted By
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {batches.map((batch) => (
              <tr key={batch.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedBatches.has(batch.id)}
                    onChange={() => handleToggleBatch(batch.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(batch.batchDate), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{batch.source}</div>
                  {batch.sourceFileName && (
                    <div className="text-xs text-gray-500">{batch.sourceFileName}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(batch.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {batch.itemCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                  {batch.matchedCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                  {batch.breakCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {batch.submittedBy || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {batch.status === ReconciliationStatus.Pending && (
                    <>
                      <button
                        onClick={() => handleRunReconciliation(batch.id, batch.batchDate)}
                        disabled={reconcilingBatchId === batch.id}
                        className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                      >
                        {reconcilingBatchId === batch.id ? 'Running...' : 'Reconcile'}
                      </button>
                      <button
                        onClick={() => handleApproveBatch(batch.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                    </>
                  )}
                  {batch.status === ReconciliationStatus.Matched && (
                    <button
                      onClick={() => handleApproveBatch(batch.id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Approve
                    </button>
                  )}
                  {batch.status === ReconciliationStatus.Approved && (
                    <span className="text-gray-400">No actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showApprovalModal && selectedBatchId && (
        <BatchApprovalModal
          batchId={selectedBatchId}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedBatchId(null);
          }}
        />
      )}

      {showBulkApprovalModal && (
        <BulkApprovalModal
          batchIds={Array.from(selectedBatches).filter(id =>
            getEligibleBatchesForApproval().some(b => b.id === id)
          )}
          onClose={() => {
            setShowBulkApprovalModal(false);
          }}
          onComplete={() => {
            setSelectedBatches(new Set());
          }}
        />
      )}
    </>
  );
}
