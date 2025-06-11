interface ClientErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent?: string;
  userId?: string;
  timestamp: string;
  componentStack?: string;
  additionalInfo?: Record<string, unknown>;
}

interface JavaScriptErrorReport {
  message: string;
  source?: string;
  line?: number;
  column?: number;
  url: string;
  userAgent?: string;
  timestamp: string;
}

class ErrorService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async logClientError(error: Error, errorInfo?: { componentStack: string }, additionalInfo?: Record<string, unknown>) {
    try {
      const errorReport: ClientErrorReport = {
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.getCurrentUserId(),
        timestamp: new Date().toISOString(),
        componentStack: errorInfo?.componentStack,
        additionalInfo,
      };

      await fetch(`${this.baseUrl}/error/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      });
    } catch (loggingError) {
      // If logging fails, log to console as fallback
      console.error('Failed to log error to server:', loggingError);
      console.error('Original error:', error);
    }
  }

  async logJavaScriptError(
    message: string,
    source?: string,
    line?: number,
    column?: number
  ) {
    try {
      const errorReport: JavaScriptErrorReport = {
        message,
        source,
        line,
        column,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      await fetch(`${this.baseUrl}/error/javascript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      });
    } catch (loggingError) {
      console.error('Failed to log JavaScript error to server:', loggingError);
    }
  }

  private getCurrentUserId(): string | undefined {
    // TODO: Implement user ID retrieval from your auth system
    // For now, return undefined or a session ID
    return undefined;
  }

  setupGlobalErrorHandlers() {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.logJavaScriptError(
        event.message,
        event.filename,
        event.lineno,
        event.colno
      );
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logClientError(
        new Error(`Unhandled promise rejection: ${event.reason}`),
        undefined,
        { type: 'unhandledrejection', reason: event.reason }
      );
    });
  }
}

export const errorService = new ErrorService();
export type { ClientErrorReport, JavaScriptErrorReport };
