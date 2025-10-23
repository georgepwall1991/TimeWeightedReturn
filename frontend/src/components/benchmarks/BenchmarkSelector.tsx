import React from 'react';
import { useGetBenchmarksQuery } from '../../services/api';

interface BenchmarkSelectorProps {
  value: string | null;
  onChange: (benchmarkId: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export const BenchmarkSelector: React.FC<BenchmarkSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  const { data: benchmarks, isLoading, error } = useGetBenchmarksQuery();

  if (error) {
    return (
      <div className="text-sm text-red-600">
        Failed to load benchmarks
      </div>
    );
  }

  const activeBenchmarks = benchmarks?.filter(b => b.isActive) || [];

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor="benchmark-select" className="text-sm font-medium text-gray-700">
        Compare to Benchmark
      </label>
      <select
        id="benchmark-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled || isLoading}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">No benchmark</option>
        {isLoading ? (
          <option disabled>Loading benchmarks...</option>
        ) : (
          activeBenchmarks.map((benchmark) => (
            <option key={benchmark.id} value={benchmark.id}>
              {benchmark.name} ({benchmark.indexSymbol})
            </option>
          ))
        )}
      </select>
      {activeBenchmarks.length === 0 && !isLoading && (
        <p className="text-xs text-gray-500">
          No active benchmarks available. Contact your administrator to add benchmarks.
        </p>
      )}
    </div>
  );
};
