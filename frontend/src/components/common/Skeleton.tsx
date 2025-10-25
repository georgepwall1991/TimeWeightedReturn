import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200';

  const variantClasses = {
    text: 'rounded-sm',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%]',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '1em' : '40px'),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Predefined skeleton layouts for common use cases

export const TreeNodeSkeleton: React.FC = () => (
  <div className="p-3 border-b border-gray-100">
    <div className="flex items-center space-x-2">
      <Skeleton variant="circular" width={20} height={20} />
      <Skeleton width="70%" height={16} />
    </div>
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
    <Skeleton width="60%" height={20} />
    <Skeleton width="100%" height={16} />
    <Skeleton width="80%" height={16} />
    <Skeleton width="90%" height={16} />
  </div>
);

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-4 py-3">
        <Skeleton height={16} />
      </td>
    ))}
  </tr>
);

export const MetricCardSkeleton: React.FC = () => (
  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
    <div className="flex items-center justify-between">
      <Skeleton width="50%" height={14} />
      <Skeleton variant="circular" width={20} height={20} />
    </div>
    <Skeleton width="70%" height={28} />
    <Skeleton width="40%" height={12} />
  </div>
);

export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 250 }) => (
  <div
    className="bg-gray-100 rounded-lg animate-pulse flex items-center justify-center"
    style={{ height: `${height}px` }}
  >
    <div className="text-gray-400">
      <svg
        className="w-16 h-16"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    </div>
  </div>
);

export const AnalyticsDashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="space-y-2">
            <Skeleton width={200} height={20} />
            <Skeleton width={150} height={14} />
          </div>
        </div>
      </div>

      {/* Date range picker */}
      <div className="space-y-2">
        <Skeleton width={120} height={16} />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} width={80} height={36} />
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <Skeleton width="50%" height={20} />
          <ChartSkeleton height={350} />
        </div>
      ))}
    </div>

    {/* Table */}
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <Skeleton width="40%" height={20} />
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {[1, 2, 3, 4].map((i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton height={14} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRowSkeleton key={i} columns={4} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export const HoldingsTableSkeleton: React.FC = () => (
  <div className="space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <Skeleton width={200} height={24} />
      <Skeleton width={100} height={36} />
    </div>

    {/* Table */}
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton height={14} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <TableRowSkeleton key={i} columns={6} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Skeleton;
