import { useState } from 'react';
import { useApproveBatchMutation } from '../../services/api';

interface BulkApprovalModalProps {
  batchIds: string[];
  onClose: () => void;
  onComplete: () => void;
}

export default function BulkApprovalModal({ batchIds, onClose, onComplete }: BulkApprovalModalProps) {
  const [comments, setComments] = useState('');
  const [approveBatch, { isLoading }] = useApproveBatchMutation();
  const [progress, setProgress] = useState({ completed: 0, total: batchIds.length, errors: [] as string[] });

  const handleBulkApprove = async () => {
    const results = { completed: 0, total: batchIds.length, errors: [] as string[] };

    for (const batchId of batchIds) {
      try {
        await approveBatch({
          batchId,
          request: {
            approvedBy: 'current-user', // TODO: Get from auth context
            comments: comments || undefined,
          },
        }).unwrap();
        results.completed++;
        setProgress({ ...results });
      } catch (error) {
        results.errors.push(`Failed to approve batch ${batchId}: ${(error as Error).message}`);
        setProgress({ ...results });
      }
    }

    if (results.errors.length === 0) {
      alert(`Successfully approved ${results.completed} batch(es)!`);
      onComplete();
      onClose();
    } else {
      alert(`Completed with ${results.errors.length} error(s). Check details.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bulk Approve Batches
          </h3>

          {progress.completed === 0 ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  You are about to approve <strong>{batchIds.length}</strong> batch(es).
                </p>
                <p className="text-sm text-gray-600">
                  This will promote all IBoR items to ABoR and mark them as approved.
                </p>
              </div>

              {/* Comments */}
              <div className="mb-4">
                <label htmlFor="bulk-comments" className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  id="bulk-comments"
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any comments..."
                  disabled={isLoading}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  This operation cannot be undone. Please confirm before proceeding.
                </p>
              </div>
            </>
          ) : (
            <div className="mb-4">
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{progress.completed} / {progress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                  />
                </div>
              </div>

              {progress.errors.length > 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-1">Errors:</p>
                  <ul className="text-xs text-red-700 list-disc list-inside">
                    {progress.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {progress.completed > 0 ? 'Close' : 'Cancel'}
            </button>
            {progress.completed === 0 && (
              <button
                onClick={handleBulkApprove}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Approving...' : `Approve ${batchIds.length} Batch(es)`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
