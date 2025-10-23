/**
 * Centralized logging service for the frontend application
 * Provides structured logging with different levels and context
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Log an informational message
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context || '');

    // In production, you might want to send warnings to a monitoring service
    if (this.isProduction) {
      this.sendToMonitoring('warn', message, context);
    }
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    console.error(`[ERROR] ${message}`, error, context || '');

    // In production, send errors to monitoring service
    if (this.isProduction) {
      this.sendToMonitoring('error', message, { error, ...context });
    }
  }

  /**
   * Log with custom level
   */
  log(level: LogLevel, message: string, context?: LogContext): void {
    switch (level) {
      case LogLevel.DEBUG:
        this.debug(message, context);
        break;
      case LogLevel.INFO:
        this.info(message, context);
        break;
      case LogLevel.WARN:
        this.warn(message, context);
        break;
      case LogLevel.ERROR:
        this.error(message, undefined, context);
        break;
    }
  }

  /**
   * Send logs to external monitoring service (e.g., Sentry, LogRocket, etc.)
   * This is a placeholder - integrate with your monitoring service
   */
  private sendToMonitoring(level: string, message: string, context?: LogContext): void {
    // TODO: Integrate with monitoring service like Sentry, LogRocket, or Application Insights
    // Example:
    // Sentry.captureMessage(message, { level, extra: context });

    // For now, just structure the data
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In a real implementation, you would send this to your backend or monitoring service
    // fetch('/api/logs', { method: 'POST', body: JSON.stringify(logEntry) });

    // Prevent logging the log itself
    if (this.isDevelopment) {
      console.debug('[MONITORING]', logEntry);
    }
  }

  /**
   * Create a logger with a specific context that's included in all log messages
   */
  createContextLogger(defaultContext: LogContext): ContextLogger {
    return new ContextLogger(this, defaultContext);
  }
}

/**
 * Context logger that includes default context in all log messages
 */
class ContextLogger {
  constructor(
    private logger: Logger,
    private defaultContext: LogContext
  ) {}

  debug(message: string, additionalContext?: LogContext): void {
    this.logger.debug(message, { ...this.defaultContext, ...additionalContext });
  }

  info(message: string, additionalContext?: LogContext): void {
    this.logger.info(message, { ...this.defaultContext, ...additionalContext });
  }

  warn(message: string, additionalContext?: LogContext): void {
    this.logger.warn(message, { ...this.defaultContext, ...additionalContext });
  }

  error(message: string, error?: Error | unknown, additionalContext?: LogContext): void {
    this.logger.error(message, error, { ...this.defaultContext, ...additionalContext });
  }
}

// Export a singleton instance
export const logger = new Logger();

// Export for creating context loggers
export { ContextLogger };

// Convenience exports
export default logger;
