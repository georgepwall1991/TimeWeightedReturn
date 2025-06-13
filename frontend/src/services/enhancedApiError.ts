// Enhanced API Error Handling for Portfolio Analytics
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

interface ErrorData {
  message?: string;
  error?: string;
  title?: string;
  code?: string;
  type?: string;
  details?: string;
  validation?: string;
}

export interface ApiError {
  status: number;
  data?: ErrorData;
  error: string;
  code?: string;
  details?: string;
  timestamp: string;
}

export interface ApiErrorContextInfo {
  operation: string;
  component: string;
  accountId?: string;
  portfolioId?: string;
  dateRange?: { from: string; to: string };
  additionalContext?: Record<string, unknown>;
}

export interface CalculationErrorDetails {
  type: 'NO_DATA' | 'INSUFFICIENT_DATA' | 'CALCULATION_FAILED' | 'INVALID_PERIOD' | 'NETWORK_ERROR' | 'UNKNOWN';
  message: string;
  suggestion: string;
  canRetry: boolean;
  fallbackAvailable: boolean;
  technicalDetails?: string;
}

export class ApiErrorHandler {
  // Normalize different error types into a consistent format
  static normalizeError(error: FetchBaseQueryError | SerializedError | undefined): ApiError {
    if (!error) {
      return {
        status: 0,
        error: 'Unknown error occurred',
        timestamp: new Date().toISOString()
      };
    }

    // Handle FetchBaseQueryError (RTK Query errors)
    if ('status' in error) {
      const fetchError = error as FetchBaseQueryError;
      return {
        status: typeof fetchError.status === 'number' ? fetchError.status : 0,
        data: fetchError.data as ErrorData,
        error: this.getErrorMessage(fetchError),
        code: this.getErrorCode(fetchError),
        details: this.getErrorDetails(fetchError),
        timestamp: new Date().toISOString()
      };
    }

    // Handle SerializedError (network/timeout errors)
    if ('message' in error) {
      return {
        status: 0,
        error: error.message || 'Network error occurred',
        timestamp: new Date().toISOString()
      };
    }

    return {
      status: 0,
      error: 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };
  }

  // Get user-friendly error messages
  static getUserFriendlyMessage(error: ApiError, context?: ApiErrorContextInfo): string {
    switch (error.status) {
      case 400:
        return this.getBadRequestMessage(error, context);
      case 401:
        return 'You are not authorized to access this resource. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return this.getNotFoundMessage(context);
      case 408:
        return 'The request timed out. Please try again.';
      case 429:
        return 'Too many requests. Please wait a moment before trying again.';
      case 500:
        return 'A server error occurred. Please try again later.';
      case 502:
        return 'The service is temporarily unavailable. Please try again later.';
      case 503:
        return 'The service is currently under maintenance. Please try again later.';
      case 504:
        return 'The request timed out. Please try again.';
      default:
        if (error.status === 0) {
          return 'Unable to connect to the server. Please check your internet connection.';
        }
        return error.data?.message || error.error || 'An unexpected error occurred.';
    }
  }

  // Handle 400 Bad Request errors with context
  private static getBadRequestMessage(error: ApiError, context?: ApiErrorContextInfo): string {
    const details = error.data?.details || error.details;

    if (details?.includes('date')) {
      return 'Invalid date format. Please use YYYY-MM-DD format.';
    }

    if (details?.includes('required')) {
      return 'Missing required information. Please check your input.';
    }

    if (context?.operation === 'calculate-twr') {
      return 'Invalid parameters for TWR calculation. Please check your date range.';
    }

    return error.data?.message || 'Invalid request. Please check your input and try again.';
  }

  // Handle 404 Not Found errors with context
  private static getNotFoundMessage(context?: ApiErrorContextInfo): string {
    if (context?.accountId) {
      return `Account not found. Please verify the account ID: ${context.accountId}`;
    }

    if (context?.portfolioId) {
      return `Portfolio not found. Please verify the portfolio ID: ${context.portfolioId}`;
    }

    return 'The requested resource was not found.';
  }

  // Extract error message from FetchBaseQueryError
  private static getErrorMessage(error: FetchBaseQueryError): string {
    if (typeof error.status === 'string') {
      return `Network error: ${error.status}`;
    }

    const data = error.data as ErrorData;
    return data?.message || data?.error || `HTTP ${error.status} error`;
  }

  // Extract error code from FetchBaseQueryError
  private static getErrorCode(error: FetchBaseQueryError): string | undefined {
    const data = error.data as ErrorData;
    return data?.code;
  }

  // Extract error details from FetchBaseQueryError
  private static getErrorDetails(error: FetchBaseQueryError): string | undefined {
    const data = error.data as ErrorData;
    return data?.details;
  }

  // Determine if an error is retryable
  static isRetryableError(error: ApiError): boolean {
    // Network errors are retryable
    if (error.status === 0) return true;

    // Server errors are retryable
    if (error.status >= 500) return true;

    // Rate limiting is retryable
    if (error.status === 429) return true;

    // Timeouts are retryable
    if (error.status === 408 || error.status === 504) return true;

    return false;
  }

  // Get retry delay in milliseconds
  static getRetryDelay(attemptNumber: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s (max)
    return Math.min(1000 * Math.pow(2, attemptNumber), 16000);
  }

  // Log error with context for debugging
  static logError(error: ApiError, context?: ApiErrorContextInfo): void {
    console.group(`🔴 API Error - ${context?.operation || 'Unknown Operation'}`);
    console.error('Error:', error);
    console.error('Context:', context);
    console.error('User Message:', this.getUserFriendlyMessage(error, context));
    console.groupEnd();

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Send to external service (DataDog, Sentry, etc.)
      this.reportToErrorService();
    }
  }

  // Report to external error service
  private static reportToErrorService(): void {
    // Implementation depends on your error reporting service
    // Example for Sentry:
    // Sentry.captureException(new Error(error.error), {
    //   tags: {
    //     operation: context?.operation,
    //     component: context?.component,
    //     status: error.status
    //   },
    //   extra: { error, context }
    // });
  }

  /**
   * Analyzes API errors and provides detailed error information for calculations
   */
  static analyzeCalculationError(
    error: FetchBaseQueryError | SerializedError | undefined,
    context: {
      accountId: string;
      accountName?: string;
      startDate?: string;
      endDate?: string;
      calculationType: 'TWR' | 'CONTRIBUTION' | 'RISK_METRICS';
    }
  ): CalculationErrorDetails {
    // Handle network/fetch errors
    if (error && 'status' in error) {
      const fetchError = error as FetchBaseQueryError;

      if (fetchError.status === 'FETCH_ERROR') {
        return {
          type: 'NETWORK_ERROR',
          message: 'Unable to connect to the analytics service',
          suggestion: 'Check your internet connection and try again',
          canRetry: true,
          fallbackAvailable: false,
          technicalDetails: 'Network connection failed'
        };
      }

      if (fetchError.status === 404) {
        return {
          type: 'NO_DATA',
          message: `Account "${context.accountName || context.accountId}" not found`,
          suggestion: 'Please verify the account exists and you have access to it',
          canRetry: false,
          fallbackAvailable: false,
          technicalDetails: 'Account not found in database'
        };
      }

      if (fetchError.status === 400) {
        const errorData = fetchError.data as ErrorData;

        if (errorData?.details?.includes('No holdings found')) {
          return {
            type: 'NO_DATA',
            message: `No holdings data available for the selected period`,
            suggestion: this.getDateRangeSuggestion(context.startDate, context.endDate),
            canRetry: false,
            fallbackAvailable: true,
            technicalDetails: errorData.details
          };
        }

        if (errorData?.details?.includes('Invalid date format')) {
          return {
            type: 'INVALID_PERIOD',
            message: 'Invalid date range specified',
            suggestion: 'Please select a valid date range with start date before end date',
            canRetry: false,
            fallbackAvailable: false,
            technicalDetails: errorData.details
          };
        }

        return {
          type: 'INVALID_PERIOD',
          message: 'Invalid request parameters',
          suggestion: 'Please check your date range and try again',
          canRetry: false,
          fallbackAvailable: false,
          technicalDetails: errorData?.details || 'Bad request'
        };
      }

      if (fetchError.status === 500) {
        const errorData = fetchError.data as ErrorData;

        if (errorData?.details?.includes('No valid sub-periods')) {
          return {
            type: 'INSUFFICIENT_DATA',
            message: 'Insufficient data for reliable calculation',
            suggestion: this.getInsufficientDataSuggestion(context.calculationType),
            canRetry: false,
            fallbackAvailable: true,
            technicalDetails: errorData.details
          };
        }

        if (errorData?.details?.includes('calculation')) {
          return {
            type: 'CALCULATION_FAILED',
            message: `${context.calculationType} calculation failed`,
            suggestion: 'This might be due to missing price data or invalid holdings',
            canRetry: true,
            fallbackAvailable: true,
            technicalDetails: errorData?.details || 'Calculation error'
          };
        }

        return {
          type: 'CALCULATION_FAILED',
          message: 'Server error during calculation',
          suggestion: 'Please try again in a few moments',
          canRetry: true,
          fallbackAvailable: false,
          technicalDetails: errorData?.details || 'Internal server error'
        };
      }
    }

    // Handle serialized errors (network issues, timeouts)
    if (error && 'message' in error) {
      const serializedError = error as SerializedError;

      if (serializedError.message?.includes('timeout')) {
        return {
          type: 'NETWORK_ERROR',
          message: 'Calculation request timed out',
          suggestion: 'The calculation is taking longer than expected. Try a shorter date range.',
          canRetry: true,
          fallbackAvailable: false,
          technicalDetails: serializedError.message
        };
      }

      return {
        type: 'UNKNOWN',
        message: 'An unexpected error occurred',
        suggestion: 'Please try again or contact support if the problem persists',
        canRetry: true,
        fallbackAvailable: false,
        technicalDetails: serializedError.message
      };
    }

    // Default unknown error
    return {
      type: 'UNKNOWN',
      message: 'Unable to complete the calculation',
      suggestion: 'Please try again or select a different date range',
      canRetry: true,
      fallbackAvailable: false,
      technicalDetails: 'Unknown error occurred'
    };
  }

  /**
   * Provides specific suggestions based on date range issues
   */
  private static getDateRangeSuggestion(startDate?: string, endDate?: string): string {
    if (!startDate || !endDate) {
      return 'Try selecting a date range within the last 2 years where holdings data is available';
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (start > today) {
      return 'Start date cannot be in the future. Please select a past date.';
    }

    if (daysDiff < 7) {
      return 'Try selecting a longer period (at least 1 week) for meaningful calculations';
    }

    if (daysDiff > 730) {
      return 'Try selecting a shorter period (less than 2 years) for better performance';
    }

    return 'Try selecting a more recent date range or check if holdings data exists for this period';
  }

  /**
   * Provides calculation-specific suggestions for insufficient data
   */
  private static getInsufficientDataSuggestion(calculationType: string): string {
    switch (calculationType) {
      case 'TWR':
        return 'Time Weighted Return requires at least 2 data points. Try a longer period or check if holdings exist for both start and end dates.';
      case 'CONTRIBUTION':
        return 'Contribution analysis requires holdings data for both start and end dates. Ensure the account had positions during this period.';
      case 'RISK_METRICS':
        return 'Risk analysis requires multiple data points over time. Try selecting a period of at least 3 months with regular holdings data.';
      default:
        return 'This calculation requires more historical data. Try selecting a longer time period.';
    }
  }

  /**
   * Generates user-friendly error messages for display
   */
  static getDisplayMessage(errorDetails: CalculationErrorDetails): {
    title: string;
    message: string;
    actionText?: string;
  } {
    switch (errorDetails.type) {
      case 'NO_DATA':
        return {
          title: 'No Data Available',
          message: errorDetails.message,
          actionText: errorDetails.canRetry ? 'Try Different Period' : undefined
        };

      case 'INSUFFICIENT_DATA':
        return {
          title: 'Insufficient Data',
          message: errorDetails.message,
          actionText: 'Select Longer Period'
        };

      case 'CALCULATION_FAILED':
        return {
          title: 'Calculation Error',
          message: errorDetails.message,
          actionText: errorDetails.canRetry ? 'Retry Calculation' : undefined
        };

      case 'INVALID_PERIOD':
        return {
          title: 'Invalid Date Range',
          message: errorDetails.message,
          actionText: 'Fix Date Range'
        };

      case 'NETWORK_ERROR':
        return {
          title: 'Connection Error',
          message: errorDetails.message,
          actionText: 'Retry'
        };

      default:
        return {
          title: 'Calculation Error',
          message: errorDetails.message,
          actionText: errorDetails.canRetry ? 'Try Again' : undefined
        };
    }
  }

  /**
   * Determines if a fallback calculation or display should be shown
   */
  static shouldShowFallback(errorDetails: CalculationErrorDetails): boolean {
    return errorDetails.fallbackAvailable &&
           (errorDetails.type === 'NO_DATA' || errorDetails.type === 'INSUFFICIENT_DATA');
  }

  /**
   * Logs detailed error information for debugging
   */
  static logCalculationError(
    errorDetails: CalculationErrorDetails,
    context: {
      accountId: string;
      calculationType: string;
      startDate?: string;
      endDate?: string;
    }
  ): void {
    console.group(`🔴 ${context.calculationType} Calculation Error`);
    console.log('Error Type:', errorDetails.type);
    console.log('Message:', errorDetails.message);
    console.log('Suggestion:', errorDetails.suggestion);
    console.log('Context:', context);
    if (errorDetails.technicalDetails) {
      console.log('Technical Details:', errorDetails.technicalDetails);
    }
    console.groupEnd();
  }
}

// React hook for error handling
export const useApiErrorHandler = () => {
  const handleError = (
    error: FetchBaseQueryError | SerializedError | undefined,
    context?: ApiErrorContextInfo
  ) => {
    const normalizedError = ApiErrorHandler.normalizeError(error);
    const userMessage = ApiErrorHandler.getUserFriendlyMessage(normalizedError, context);

    // Log error for debugging
    ApiErrorHandler.logError(normalizedError, context);

    return { normalizedError, userMessage };
  };

  return { handleError };
};

// Export utility functions for common error scenarios
export const isDataError = (error: FetchBaseQueryError | SerializedError | undefined): boolean => {
  if (!error || !('status' in error)) return false;
  const status = error.status;
  return status === 400 || status === 404;
};

export const isServerError = (error: FetchBaseQueryError | SerializedError | undefined): boolean => {
  if (!error || !('status' in error)) return false;
  const status = error.status;
  return typeof status === 'number' && status >= 500;
};

export const isNetworkError = (error: FetchBaseQueryError | SerializedError | undefined): boolean => {
  if (!error || !('status' in error)) return false;
  const status = error.status;
  return status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR';
};
