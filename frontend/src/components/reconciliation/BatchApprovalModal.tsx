import { useState } from 'react';
import { useApproveBatchMutation, useRejectBatchMutation } from '../../services/api';

interface BatchApprovalModalProps {
  batchId: string;
  onClose: () => void;
}

export default function BatchApprovalModal({ batchId, onClose }: BatchApprovalModalProps) {
  const [comments, setComments] = useState('');
  const [action, setAction] = useState<'approve' | 'reject'>('approve');

  const [approveBatch, { isLoading: isApproving }] = useApproveBatchMutation();
  const [rejectBatch, { isLoading: isRejecting }] = useRejectBatchMutation();

  const isLoading = isApproving || isRejecting;

  const handleSubmit = async () => {
    try {
      if (action === 'approve') {
        await approveBatch({
          batchId,
          request: {
            approvedBy: 'current-user', // TODO: Get from auth context
            comments: comments || undefined,
          },
        }).unwrap();
        alert('Batch approved successfully!');
      } else {
        if (!comments.trim()) {
          alert('Please provide a reason for rejection');
          return;
        }
        await rejectBatch({
          batchId,
          request: {
            approvedBy: 'current-user', // TODO: Get from auth context (rejectedBy)
            comments,
          },
        }).unwrap();
        alert('Batch rejected successfully!');
      }
      onClose();
    } catch (error) {
      alert('Failed to ' + action + ' batch: ' + (error as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {action === 'approve' ? 'Approve' : 'Reject'} Reconciliation Batch
          </h3>

          <div className="space-y-4">
            {/* Action Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="approve"
                    checked={action === 'approve'}
                    onChange={(e) => setAction(e.target.value as 'approve')}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-green-600 font-medium">Approve</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="reject"
                    checked={action === 'reject'}
                    onChange={(e) => setAction(e.target.value as 'reject')}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-red-600 font-medium">Reject</span>
                </label>
              </div>
            </div>

            {/* Comments */}
            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                {action === 'reject' ? 'Reason (Required)' : 'Comments (Optional)'}
              </label>
              <textarea
                id="comments"
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder={action === 'reject' ? 'Explain why this batch is being rejected...' : 'Add any comments...'}
                disabled={isLoading}
              />
            </div>

            {action === 'approve' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Approving this batch will promote all IBoR items to ABoR and mark them as approved.
                </p>
              </div>
            )}

            {action === 'reject' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  Rejecting this batch will mark all items as rejected and prevent them from being used.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || (action === 'reject' && !comments.trim())}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isLoading ? 'Processing...' : action === 'approve' ? 'Approve Batch' : 'Reject Batch'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
