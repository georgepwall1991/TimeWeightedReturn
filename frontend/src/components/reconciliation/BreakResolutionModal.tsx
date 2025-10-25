import { useState } from 'react';
import { useResolveBreakMutation } from '../../services/api';

interface BreakResolutionModalProps {
  breakId: string;
  onClose: () => void;
}

export default function BreakResolutionModal({ breakId, onClose }: BreakResolutionModalProps) {
  const [resolutionAction, setResolutionAction] = useState('');
  const [comments, setComments] = useState('');

  const [resolveBreak, { isLoading }] = useResolveBreakMutation();

  const resolutionOptions = [
    { value: 'Accept IBoR', label: 'Accept IBoR Data', description: 'Use the Investment Book of Record data' },
    { value: 'Keep ABoR', label: 'Keep ABoR Data', description: 'Keep the existing Accounting Book of Record data' },
    { value: 'Manual Override', label: 'Manual Override', description: 'Manually corrected the data' },
    { value: 'Data Correction', label: 'Data Correction', description: 'Corrected at the source' },
    { value: 'Investigate', label: 'Mark for Investigation', description: 'Needs further review' },
  ];

  const handleSubmit = async () => {
    if (!resolutionAction) {
      alert('Please select a resolution action');
      return;
    }

    try {
      await resolveBreak({
        breakId,
        request: {
          resolvedBy: 'current-user', // TODO: Get from auth context
          resolutionAction,
          comments: comments || undefined,
        },
      }).unwrap();
      alert('Break resolved successfully!');
      onClose();
    } catch (error) {
      alert('Failed to resolve break: ' + (error as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resolve Reconciliation Break
          </h3>

          <div className="space-y-4">
            {/* Resolution Action Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Action *
              </label>
              <div className="space-y-2">
                {resolutionOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      resolutionAction === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      checked={resolutionAction === option.value}
                      onChange={(e) => setResolutionAction(e.target.value)}
                      className="mt-1 mr-3"
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <label htmlFor="resolution-comments" className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                id="resolution-comments"
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any additional notes about the resolution..."
                disabled={isLoading}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                Resolving this break will mark it as resolved and remove it from the unresolved breaks list.
              </p>
            </div>
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
              disabled={isLoading || !resolutionAction}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resolving...' : 'Resolve Break'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
