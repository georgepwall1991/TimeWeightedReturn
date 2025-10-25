using Microsoft.Extensions.Logging;
using Polly;
using Polly.CircuitBreaker;
using Polly.Retry;
using Polly.Timeout;

namespace Application.Configuration;

/// <summary>
/// Defines resilience policies for external service calls using Polly.
/// Provides retry, circuit breaker, and timeout policies to handle transient failures.
/// </summary>
public static class ResiliencePolicies
{
    /// <summary>
    /// Creates a retry policy for HTTP requests with exponential backoff.
    /// Handles transient HTTP errors (5xx, 408) and network failures.
    /// </summary>
    public static IAsyncPolicy<HttpResponseMessage> GetHttpRetryPolicy()
    {
        return Policy<HttpResponseMessage>
            .Handle<HttpRequestException>()
            .OrResult(response =>
                (int)response.StatusCode >= 500 ||
                response.StatusCode == System.Net.HttpStatusCode.RequestTimeout)
            .WaitAndRetryAsync(
                retryCount: 3,
                sleepDurationProvider: retryAttempt =>
                    TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)), // 2, 4, 8 seconds
                onRetry: (outcome, timespan, retryCount, context) =>
                {
                    var logger = context.GetLogger();
                    if (outcome.Exception != null)
                    {
                        logger?.LogWarning(
                            "Retry {RetryCount} after {Delay}s due to: {Exception}",
                            retryCount, timespan.TotalSeconds, outcome.Exception.Message);
                    }
                    else
                    {
                        logger?.LogWarning(
                            "Retry {RetryCount} after {Delay}s due to status: {StatusCode}",
                            retryCount, timespan.TotalSeconds, outcome.Result.StatusCode);
                    }
                });
    }

    /// <summary>
    /// Creates a circuit breaker policy to prevent cascading failures.
    /// Opens circuit after 5 consecutive failures, stays open for 30 seconds.
    /// </summary>
    public static IAsyncPolicy<HttpResponseMessage> GetHttpCircuitBreakerPolicy()
    {
        return Policy<HttpResponseMessage>
            .Handle<HttpRequestException>()
            .OrResult(response =>
                (int)response.StatusCode >= 500 ||
                response.StatusCode == System.Net.HttpStatusCode.RequestTimeout)
            .CircuitBreakerAsync(
                handledEventsAllowedBeforeBreaking: 5,
                durationOfBreak: TimeSpan.FromSeconds(30),
                onBreak: (outcome, breakDuration, context) =>
                {
                    var logger = context.GetLogger();
                    if (outcome.Exception != null)
                    {
                        logger?.LogError(
                            "Circuit breaker opened for {Duration}s due to: {Exception}",
                            breakDuration.TotalSeconds, outcome.Exception.Message);
                    }
                    else
                    {
                        logger?.LogError(
                            "Circuit breaker opened for {Duration}s due to status: {StatusCode}",
                            breakDuration.TotalSeconds, outcome.Result.StatusCode);
                    }
                },
                onReset: context =>
                {
                    var logger = context.GetLogger();
                    logger?.LogInformation("Circuit breaker reset - normal operation resumed");
                },
                onHalfOpen: () =>
                {
                    // Logger not available in this callback
                });
    }

    /// <summary>
    /// Creates a timeout policy for HTTP requests.
    /// Prevents requests from hanging indefinitely.
    /// </summary>
    public static IAsyncPolicy<HttpResponseMessage> GetHttpTimeoutPolicy()
    {
        return Policy.TimeoutAsync<HttpResponseMessage>(
            timeout: TimeSpan.FromSeconds(30),
            onTimeoutAsync: (context, timespan, task) =>
            {
                var logger = context.GetLogger();
                logger?.LogWarning("Request timed out after {Timeout}s", timespan.TotalSeconds);
                return Task.CompletedTask;
            });
    }

    /// <summary>
    /// Creates a combined policy that wraps timeout, retry, and circuit breaker.
    /// Order: Timeout -> Retry -> Circuit Breaker (innermost to outermost)
    /// </summary>
    public static IAsyncPolicy<HttpResponseMessage> GetCombinedHttpPolicy()
    {
        // Circuit breaker is outermost - prevents retry attempts when circuit is open
        // Retry is in the middle - retries transient failures
        // Timeout is innermost - applies to each individual attempt
        return Policy.WrapAsync(
            GetHttpCircuitBreakerPolicy(),
            GetHttpRetryPolicy(),
            GetHttpTimeoutPolicy());
    }

    /// <summary>
    /// Extension method to retrieve logger from Polly context.
    /// </summary>
    private static Microsoft.Extensions.Logging.ILogger? GetLogger(this Context context)
    {
        if (context.TryGetValue("Logger", out var logger))
        {
            return logger as Microsoft.Extensions.Logging.ILogger;
        }
        return null;
    }
}
