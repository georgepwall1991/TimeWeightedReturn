using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Data
{
    public class PortfolioContextFactory : IDesignTimeDbContextFactory<PortfolioContext>
    {
        public PortfolioContext CreateDbContext(string[] args)
        {
            // Get environment
            string environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

            // Build config
            IConfiguration config = new ConfigurationBuilder()
                .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../Api"))
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{environment}.json", optional: true)
                .AddEnvironmentVariables()
                .Build();

            // Get connection string - default to PostgreSQL for migrations
            var connectionString = config.GetConnectionString("portfoliodb") 
                ?? "Host=localhost;Database=portfoliodb;Username=postgres;Password=postgres";

            var optionsBuilder = new DbContextOptionsBuilder<PortfolioContext>();
            optionsBuilder.UseNpgsql(connectionString);

            return new PortfolioContext(optionsBuilder.Options);
        }
    }
}
