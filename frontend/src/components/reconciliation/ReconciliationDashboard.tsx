import { useState } from 'react';
import { useGetReconciliationDashboardQuery } from '../../services/api';
import FileUpload from './FileUpload';
import BatchList from './BatchList';
import BreaksList from './BreaksList';

export default function ReconciliationDashboard() {
  const { data: dashboard, isLoading, error, refetch } = useGetReconciliationDashboardQuery();
  const [activeTab, setActiveTab] = useState<'upload' | 'batches' | 'breaks'>('upload');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadSuccess = (batchId: string) => {
    setUploadSuccess(`File uploaded successfully! Batch ID: ${batchId}`);
    setUploadError(null);
    refetch(); // Refresh dashboard stats
    setTimeout(() => setUploadSuccess(null), 5000);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
    setUploadSuccess(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading reconciliation dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load reconciliation dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reconciliation</h1>
        <p className="text-gray-600 mt-1">ABoR/IBoR workflow management</p>
      </div>

      {/* Success/Error Messages */}
      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{uploadSuccess}</p>
        </div>
      )}

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{uploadError}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Batches</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{dashboard?.totalBatches || 0}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Pending Batches</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">{dashboard?.pendingBatches || 0}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Approved Batches</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{dashboard?.approvedBatches || 0}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Unresolved Breaks</div>
          <div className="text-3xl font-bold text-red-600 mt-2">{dashboard?.unresolvedBreaks || 0}</div>
        </div>
      </div>

      {/* Breaks by Type */}
      {dashboard && dashboard.breaksByType.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Breaks by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {dashboard.breaksByType.map(({ breakType, count }) => (
              <div key={breakType} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-600 mt-1">{breakType}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Upload
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`${
              activeTab === 'batches'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Batches
            {dashboard && dashboard.pendingBatches > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs">
                {dashboard.pendingBatches}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('breaks')}
            className={`${
              activeTab === 'breaks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Breaks
            {dashboard && dashboard.unresolvedBreaks > 0 && (
              <span className="ml-2 bg-red-100 text-red-800 py-0.5 px-2 rounded-full text-xs">
                {dashboard.unresolvedBreaks}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'upload' && (
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        )}

        {activeTab === 'batches' && <BatchList />}

        {activeTab === 'breaks' && <BreaksList />}
      </div>
    </div>
  );
}
