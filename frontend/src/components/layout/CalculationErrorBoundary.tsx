import React from "react";
import { AlertTriangle, RefreshCw, Calendar, Info, TrendingUp } from "lucide-react";
import { ApiErrorHandler, type CalculationErrorDetails } from "../../services/enhancedApiError";
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

interface CalculationErrorBoundaryProps {
  children?: React.ReactNode;
  onRetry?: () => void;
  error?: FetchBaseQueryError | SerializedError;
  accountId?: string;
  accountName?: string;
  startDate?: string;
  endDate?: string;
  calculationType?: 'TWR' | 'CONTRIBUTION' | 'RISK_METRICS';
  fallbackComponent?: React.ReactNode;
}

interface CalculationErrorFallbackProps {
  errorDetails: CalculationErrorDetails;
  onRetry?: () => void;
  onChangePeriod?: () => void;
  fallbackComponent?: React.ReactNode;
}

const CalculationErrorFallback: React.FC<CalculationErrorFallbackProps> = ({
  errorDetails,
  onRetry,
  onChangePeriod,
  fallbackComponent
}) => {
  const displayMessage = ApiErrorHandler.getDisplayMessage(errorDetails);
  const shouldShowFallback = ApiErrorHandler.shouldShowFallback(errorDetails);

  // Show fallback component if available and appropriate
  if (shouldShowFallback && fallbackComponent) {
    return (
      <div className="space-y-4">
        {/* Warning message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                {displayMessage.title}
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                {errorDetails.message}
              </p>
              <p className="mt-2 text-sm text-yellow-600">
                Showing estimated data based on available information.
              </p>
            </div>
          </div>
        </div>

        {/* Fallback content */}
        {fallbackComponent}
      </div>
    );
  }

  // Get appropriate icon and colors based on error type
  const getErrorIcon = () => {
    switch (errorDetails.type) {
      case 'NO_DATA':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'INSUFFICIENT_DATA':
        return <TrendingUp className="w-5 h-5 text-orange-500" />;
      case 'NETWORK_ERROR':
        return <RefreshCw className="w-5 h-5 text-purple-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  const getErrorColors = () => {
    switch (errorDetails.type) {
      case 'NO_DATA':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          title: 'text-blue-800',
          text: 'text-blue-700',
          button: 'bg-blue-100 hover:bg-blue-200 text-blue-800'
        };
      case 'INSUFFICIENT_DATA':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          title: 'text-orange-800',
          text: 'text-orange-700',
          button: 'bg-orange-100 hover:bg-orange-200 text-orange-800'
        };
      case 'NETWORK_ERROR':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          title: 'text-purple-800',
          text: 'text-purple-700',
          button: 'bg-purple-100 hover:bg-purple-200 text-purple-800'
        };
      default:
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          title: 'text-red-800',
          text: 'text-red-700',
          button: 'bg-red-100 hover:bg-red-200 text-red-800'
        };
    }
  };

  const colors = getErrorColors();

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-6`}>
      <div className="flex items-start">
        <div className="shrink-0 mr-4">
          {getErrorIcon()}
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-medium ${colors.title} mb-2`}>
            {displayMessage.title}
          </h3>

          <div className={`text-sm ${colors.text} space-y-2`}>
            <p>{errorDetails.message}</p>
            <p className="font-medium">{errorDetails.suggestion}</p>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            {errorDetails.canRetry && onRetry && (
              <button
                onClick={onRetry}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${colors.button}`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {displayMessage.actionText || 'Retry'}
              </button>
            )}

            {(errorDetails.type === 'NO_DATA' || errorDetails.type === 'INSUFFICIENT_DATA') && onChangePeriod && (
              <button
                onClick={onChangePeriod}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${colors.button}`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Change Period
              </button>
            )}
          </div>

          {/* Technical details for debugging (only in development) */}
          {process.env.NODE_ENV === 'development' && errorDetails.technicalDetails && (
            <details className="mt-4">
              <summary className={`text-xs ${colors.text} cursor-pointer hover:underline`}>
                Technical Details
              </summary>
              <pre className={`mt-2 text-xs ${colors.text} bg-white bg-opacity-50 p-2 rounded-sm border overflow-auto`}>
                {errorDetails.technicalDetails}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export const CalculationErrorBoundary: React.FC<CalculationErrorBoundaryProps> = ({
  children,
  onRetry,
  error,
  accountId = '',
  accountName,
  startDate,
  endDate,
  calculationType = 'TWR',
  fallbackComponent
}) => {
  // If there's an error, analyze it and show appropriate fallback
  if (error) {
    const errorDetails = ApiErrorHandler.analyzeCalculationError(error, {
      accountId,
      accountName,
      startDate,
      endDate,
      calculationType
    });

    // Log error for debugging
    ApiErrorHandler.logCalculationError(errorDetails, {
      accountId,
      calculationType,
      startDate,
      endDate
    });

    const handleChangePeriod = () => {
      // This could trigger a callback to parent component to show date picker
      // For now, we'll just suggest the user to change the period manually
      console.log('User requested to change period');
    };

    return (
      <CalculationErrorFallback
        errorDetails={errorDetails}
        onRetry={onRetry}
        onChangePeriod={handleChangePeriod}
        fallbackComponent={fallbackComponent}
      />
    );
  }

  // No error, render children normally (or nothing if no children)
  return <>{children || null}</>;
};



export default CalculationErrorBoundary;
