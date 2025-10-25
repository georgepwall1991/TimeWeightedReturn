import { useState } from 'react';
import { Plus, Edit, Trash2, Loader2, Search, CheckCircle, XCircle } from 'lucide-react';
import {
  useGetBenchmarksQuery,
  useCreateBenchmarkMutation,
  useUpdateBenchmarkMutation,
  useDeleteBenchmarkMutation,
} from '../../services/api';
import type { BenchmarkDto } from '../../types/benchmark';
import BenchmarkFormModal from './BenchmarkFormModal';

export default function BenchmarksManagement() {
  const { data: benchmarks = [], isLoading, error } = useGetBenchmarksQuery();
  const [createBenchmark] = useCreateBenchmarkMutation();
  const [updateBenchmark] = useUpdateBenchmarkMutation();
  const [deleteBenchmark] = useDeleteBenchmarkMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingBenchmark, setEditingBenchmark] = useState<BenchmarkDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Apply search filter
  const filteredBenchmarks = benchmarks.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.indexSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingBenchmark(null);
    setShowModal(true);
  };

  const handleEdit = (benchmark: BenchmarkDto) => {
    setEditingBenchmark(benchmark);
    setShowModal(true);
  };

  const handleDelete = async (benchmark: BenchmarkDto) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${benchmark.name}"?\n\nThis action cannot be undone.`
      )
    ) {
      try {
        await deleteBenchmark({ benchmarkId: benchmark.id }).unwrap();
      } catch (error: any) {
        console.error('Failed to delete benchmark:', error);
        const errorMessage = error?.data?.message || 'Failed to delete benchmark.';
        alert(errorMessage);
      }
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingBenchmark) {
        await updateBenchmark({
          benchmarkId: editingBenchmark.id,
          body: data,
        }).unwrap();
      } else {
        await createBenchmark(data).unwrap();
      }
      setShowModal(false);
    } catch (error: any) {
      console.error('Failed to save benchmark:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading benchmarks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load benchmarks. Please try again later.</p>
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
              placeholder="Search benchmarks by name or symbol..."
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
          <span>New Benchmark</span>
        </button>
      </div>

      {/* Benchmarks Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredBenchmarks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No benchmarks found matching your search' : 'No benchmarks yet'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Benchmark</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBenchmarks.map((benchmark) => (
                  <tr key={benchmark.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{benchmark.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{benchmark.indexSymbol}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-md truncate">
                        {benchmark.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{benchmark.currency}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {benchmark.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(benchmark)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(benchmark)}
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
        <BenchmarkFormModal
          benchmark={editingBenchmark}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
