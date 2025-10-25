using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services.Initialization;

/// <summary>
/// Hosted service that runs data initialization tasks on application startup.
/// This ensures critical data (like FX rates) is available before the app starts serving requests.
/// </summary>
public class DataInitializationHostedService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DataInitializationHostedService> _logger;

    public DataInitializationHostedService(
        IServiceProvider serviceProvider,
        ILogger<DataInitializationHostedService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting data initialization...");

        try
        {
            using var scope = _serviceProvider.CreateScope();

            // Initialize FX rates
            var fxRateInitService = scope.ServiceProvider.GetRequiredService<FxRateInitializationService>();
            await fxRateInitService.InitializeAsync(cancellationToken);

            _logger.LogInformation("Data initialization completed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during data initialization. Application will continue, but some features may not work correctly.");
            // Don't throw - we want the app to start even if initialization fails
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
