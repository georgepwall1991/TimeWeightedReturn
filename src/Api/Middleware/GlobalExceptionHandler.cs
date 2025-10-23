using Domain.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Api.Middleware;

/// <summary>
/// Global exception handler that converts exceptions to Problem Details responses
/// </summary>
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var correlationId = Guid.NewGuid().ToString();

        // Log the exception with correlation ID
        _logger.LogError(
            exception,
            "Exception occurred. CorrelationId: {CorrelationId}, Path: {Path}",
            correlationId,
            httpContext.Request.Path);

        ProblemDetails problemDetails;

        switch (exception)
        {
            case ValidationException validationEx:
                problemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Validation Failed",
                    Detail = "One or more validation errors occurred.",
                    Extensions =
                    {
                        ["correlationId"] = correlationId,
                        ["errors"] = validationEx.Errors.Select(e => new
                        {
                            field = e.PropertyName,
                            message = e.ErrorMessage
                        })
                    }
                };
                break;

            case InsufficientPriceDataException priceEx:
                problemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Price Data Not Found",
                    Detail = "The required price data is not available for the requested period.",
                    Extensions = { ["correlationId"] = correlationId }
                };
                break;

            case InsufficientHoldingsDataException holdingsEx:
                problemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Holdings Data Not Found",
                    Detail = "No holdings data available for the specified account and date.",
                    Extensions = { ["correlationId"] = correlationId }
                };
                break;

            case InvalidDateRangeException dateEx:
                problemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid Date Range",
                    Detail = "The specified date range is invalid. Start date must be before or equal to end date.",
                    Extensions = { ["correlationId"] = correlationId }
                };
                break;

            case CurrencyConversionException currencyEx:
                problemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Currency Conversion Error",
                    Detail = "The required foreign exchange rate is not available.",
                    Extensions = { ["correlationId"] = correlationId }
                };
                break;

            case DomainException domainEx:
                problemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Business Rule Violation",
                    Detail = "A business rule was violated. Please check your request and try again.",
                    Extensions = { ["correlationId"] = correlationId }
                };
                break;

            case FormatException formatEx:
                problemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid Format",
                    Detail = "The provided data format is invalid. Please check your input and try again.",
                    Extensions = { ["correlationId"] = correlationId }
                };
                break;

            case ArgumentException argEx:
                problemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid Argument",
                    Detail = argEx.Message,
                    Extensions = { ["correlationId"] = correlationId }
                };
                break;

            case NotImplementedException notImplEx:
                _logger.LogWarning(notImplEx, "Feature not yet implemented");
                problemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status501NotImplemented,
                    Title = "Feature Not Implemented",
                    Detail = "This feature is currently under development and not yet available.",
                    Extensions = { ["correlationId"] = correlationId }
                };
                break;

            case KeyNotFoundException keyNotFoundEx:
                problemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Resource Not Found",
                    Detail = keyNotFoundEx.Message,
                    Extensions = { ["correlationId"] = correlationId }
                };
                break;

            default:
                problemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status500InternalServerError,
                    Title = "Internal Server Error",
                    Detail = "An unexpected error occurred. Please contact support if the problem persists.",
                    Extensions = { ["correlationId"] = correlationId }
                };
                break;
        }

        httpContext.Response.StatusCode = problemDetails.Status ?? StatusCodes.Status500InternalServerError;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
