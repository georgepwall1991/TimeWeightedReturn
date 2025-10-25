import { useState, useCallback } from 'react';
import { useImportFileMutation } from '../../services/api';
import ManualEntryModal from './ManualEntryModal';

interface FileUploadProps {
  onUploadSuccess?: (batchId: string) => void;
  onUploadError?: (error: string) => void;
}

export default function FileUpload({ onUploadSuccess, onUploadError }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'Transactions' | 'Holdings' | 'Prices'>('Transactions');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const [importFile, { isLoading }] = useImportFileMutation();

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.txt'))) {
      setFile(droppedFile);
    } else {
      onUploadError?.('Please upload a CSV or TXT file');
    }
  }, [onUploadError]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      onUploadError?.('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('importType', importType);
    formData.append('submittedBy', 'current-user'); // TODO: Get from auth context

    try {
      const result = await importFile(formData).unwrap();

      if (result.success && result.batchId) {
        onUploadSuccess?.(result.batchId);
        setFile(null); // Clear file after successful upload
      } else {
        const errorMsg = result.errors.join(', ') || 'Upload failed';
        onUploadError?.(errorMsg);
      }
    } catch (error) {
      onUploadError?.('Failed to upload file: ' + (error as Error).message);
    }
  };

  const handleDownloadTemplate = (templateType: string) => {
    const baseUrl = 'http://localhost:5011'; // TODO: Get from env config
    window.open(`${baseUrl}/api/reconciliation/templates/${templateType.toLowerCase()}`, '_blank');
  };

  const handleManualEntrySave = async (data: any) => {
    // Convert the manual entry data to CSV format and upload it
    const csv = convertToCSV(data, importType);
    const blob = new Blob([csv], { type: 'text/csv' });
    const file = new File([blob], `manual_${importType.toLowerCase()}_${Date.now()}.csv`, { type: 'text/csv' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('importType', importType);
    formData.append('submittedBy', 'current-user'); // TODO: Get from auth context

    try {
      const result = await importFile(formData).unwrap();

      if (result.success && result.batchId) {
        onUploadSuccess?.(result.batchId);
      } else {
        const errorMsg = result.errors.join(', ') || 'Failed to save entry';
        onUploadError?.(errorMsg);
      }
    } catch (error) {
      onUploadError?.('Failed to save entry: ' + (error as Error).message);
    }
  };

  const convertToCSV = (data: any, type: string): string => {
    switch (type) {
      case 'Transactions':
        return `AccountCode,Date,Type,InstrumentCode,Quantity,Price,Amount,Currency,Description\n${data.accountCode},${data.date},${data.type},${data.instrumentCode},${data.quantity},${data.price},${data.amount},${data.currency},${data.description}`;
      case 'Holdings':
        return `AccountCode,Date,InstrumentCode,Quantity,AverageCost,MarketValue,Currency\n${data.accountCode},${data.date},${data.instrumentCode},${data.quantity},${data.averageCost},${data.marketValue},${data.currency}`;
      case 'Prices':
        return `InstrumentCode,Date,Price,Currency\n${data.instrumentCode},${data.date},${data.price},${data.currency}`;
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Import Data</h2>

      {/* CSV Template Downloads */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">Need a template?</h3>
            <p className="text-xs text-blue-700">Download a CSV template with example data to get started</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleDownloadTemplate('Transactions')}
              className="px-3 py-1 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors"
            >
              Transactions
            </button>
            <button
              onClick={() => handleDownloadTemplate('Holdings')}
              className="px-3 py-1 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors"
            >
              Holdings
            </button>
            <button
              onClick={() => handleDownloadTemplate('Prices')}
              className="px-3 py-1 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors"
            >
              Prices
            </button>
          </div>
        </div>
      </div>

      {/* Import Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Import Type
        </label>
        <div className="flex space-x-4">
          {(['Transactions', 'Holdings', 'Prices'] as const).map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="radio"
                value={type}
                checked={importType === type}
                onChange={(e) => setImportType(e.target.value as any)}
                className="mr-2"
                disabled={isLoading}
              />
              <span className="text-sm">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* File Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          accept=".csv,.txt"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isLoading}
        />

        {file ? (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
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
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024).toFixed(2)} KB
            </p>
            <button
              onClick={() => setFile(null)}
              className="text-sm text-blue-600 hover:text-blue-700"
              disabled={isLoading}
            >
              Choose different file
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
              >
                Upload a file
              </label>
              <span> or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500">CSV or TXT up to 10MB</p>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => setShowManualEntry(true)}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
        >
          Manual Entry
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Uploading...' : 'Upload & Import'}
        </button>
      </div>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <ManualEntryModal
          entryType={importType}
          onClose={() => setShowManualEntry(false)}
          onSave={handleManualEntrySave}
        />
      )}
    </div>
  );
}
