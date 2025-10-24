import React, { useState } from 'react';
import {
  useGetBenchmarksQuery,
  useCreateBenchmarkMutation,
  useUpdateBenchmarkMutation,
  useDeleteBenchmarkMutation,
} from '../../services/api';
import type { BenchmarkDto, CreateBenchmarkRequest, UpdateBenchmarkRequest } from '../../types/benchmark';

export const BenchmarkManagement: React.FC = () => {
  const { data: benchmarks, isLoading, error } = useGetBenchmarksQuery();
  const [createBenchmark] = useCreateBenchmarkMutation();
  const [updateBenchmark] = useUpdateBenchmarkMutation();
  const [deleteBenchmark] = useDeleteBenchmarkMutation();

  const [isCreating, setIsCreating] = useState(false);
  const [editingBenchmark, setEditingBenchmark] = useState<BenchmarkDto | null>(null);

  const [formData, setFormData] = useState<CreateBenchmarkRequest>({
    name: '',
    indexSymbol: '',
    description: '',
    currency: 'USD',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBenchmark(formData).unwrap();
      setFormData({ name: '', indexSymbol: '', description: '', currency: 'USD' });
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create benchmark:', err);
      alert('Failed to create benchmark. Please try again.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBenchmark) return;

    try {
      const updateData: UpdateBenchmarkRequest = {
        name: formData.name,
        description: formData.description,
        isActive: editingBenchmark.isActive,
      };
      await updateBenchmark({
        benchmarkId: editingBenchmark.id,
        body: updateData,
      }).unwrap();
      setEditingBenchmark(null);
      setFormData({ name: '', indexSymbol: '', description: '', currency: 'USD' });
    } catch (err) {
      console.error('Failed to update benchmark:', err);
      alert('Failed to update benchmark. Please try again.');
    }
  };

  const handleDelete = async (benchmarkId: string, benchmarkName: string) => {
    if (!confirm(`Are you sure you want to delete "${benchmarkName}"?`)) return;

    try {
      await deleteBenchmark({ benchmarkId }).unwrap();
    } catch (err) {
      console.error('Failed to delete benchmark:', err);
      alert('Failed to delete benchmark. Please try again.');
    }
  };

  const handleToggleActive = async (benchmark: BenchmarkDto) => {
    try {
      const updateData: UpdateBenchmarkRequest = {
        name: benchmark.name,
        description: benchmark.description,
        isActive: !benchmark.isActive,
      };
      await updateBenchmark({
        benchmarkId: benchmark.id,
        body: updateData,
      }).unwrap();
    } catch (err) {
      console.error('Failed to toggle benchmark status:', err);
      alert('Failed to update benchmark status. Please try again.');
    }
  };

  const startEdit = (benchmark: BenchmarkDto) => {
    setEditingBenchmark(benchmark);
    setFormData({
      name: benchmark.name,
      indexSymbol: benchmark.indexSymbol,
      description: benchmark.description || '',
      currency: benchmark.currency,
    });
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingBenchmark(null);
    setIsCreating(false);
    setFormData({ name: '', indexSymbol: '', description: '', currency: 'USD' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-sm font-medium text-red-800">Failed to load benchmarks</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Benchmark Management</h2>
        {!isCreating && !editingBenchmark && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            Add Benchmark
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingBenchmark) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingBenchmark ? 'Edit Benchmark' : 'Create New Benchmark'}
          </h3>
          <form onSubmit={editingBenchmark ? handleUpdate : handleCreate} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., S&P 500"
              />
            </div>

            <div>
              <label htmlFor="indexSymbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Index Symbol
              </label>
              <input
                type="text"
                id="indexSymbol"
                required
                value={formData.indexSymbol}
                onChange={(e) => setFormData({ ...formData, indexSymbol: e.target.value })}
                disabled={!!editingBenchmark}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
                placeholder="e.g., SPY"
              />
              {editingBenchmark && (
                <p className="text-xs text-gray-500 mt-1">Symbol cannot be changed after creation</p>
              )}
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Currency
              </label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                disabled={!!editingBenchmark}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
              {editingBenchmark && (
                <p className="text-xs text-gray-500 mt-1">Currency cannot be changed after creation</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Optional description"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {editingBenchmark ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-hidden focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Benchmarks List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Existing Benchmarks</h3>
        </div>
        {benchmarks && benchmarks.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {benchmarks.map((benchmark) => (
              <div key={benchmark.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{benchmark.name}</h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">({benchmark.indexSymbol})</span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          benchmark.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {benchmark.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {benchmark.description && (
                      <p className="text-sm text-gray-600 mt-1">{benchmark.description}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Currency: {benchmark.currency} | Created:{' '}
                      {new Date(benchmark.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(benchmark)}
                      className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      {benchmark.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => startEdit(benchmark)}
                      className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(benchmark.id, benchmark.name)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
            <p>No benchmarks found. Create your first benchmark to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};
