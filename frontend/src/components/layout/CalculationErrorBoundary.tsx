import React from 'react';
import type { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface CalculationErrorFallbackProps {
  onRetry?: () => void;
}

const CalculationErrorFallback: React.FC<CalculationErrorFallbackProps> = ({ onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <svg
          className="h-5 w-5 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-red-800">
          Calculation Error
        </h3>
        <div className="mt-2 text-sm text-red-700">
          <p>
            Unable to calculate the requested metrics. This might be due to missing data
            or an unexpected calculation error.
          </p>
        </div>
        {onRetry && (
          <div className="mt-3">
            <button
              onClick={onRetry}
              className="bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium py-1 px-3 rounded-md transition-colors"
            >
              Retry Calculation
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

interface CalculationErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

export const CalculationErrorBoundary: React.FC<CalculationErrorBoundaryProps> = ({
  children,
  onRetry
}) => (
  <ErrorBoundary fallback={<CalculationErrorFallback onRetry={onRetry} />}>
    {children}
  </ErrorBoundary>
);
