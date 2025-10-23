using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Api.Controllers;
using Application.Services;
using Infrastructure.Data;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace Api.Tests.Authorization;

/// <summary>
/// Integration tests for role-based authorization policies
/// Tests ensure that endpoints are protected by appropriate authorization policies
/// </summary>
public class AuthorizationIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public AuthorizationIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Theory]
    [InlineData("/api/admin/seed-test-data", "POST")]
    [InlineData("/api/admin/data-summary", "GET")]
    public async Task AdminEndpoints_RequireAdminRole(string endpoint, string method)
    {
        // Arrange - Create client with authenticated user (non-admin)
        var client = CreateClientWithRole("Viewer");

        // Act
        HttpResponseMessage response;
        if (method == "GET")
            response = await client.GetAsync(endpoint);
        else
            response = await client.PostAsync(endpoint, new StringContent("", Encoding.UTF8, "application/json"));

        // Assert - Should be forbidden (not authorized)
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [InlineData("/api/client")]
    [InlineData("/api/client/00000000-0000-0000-0000-000000000001")]
    [InlineData("/api/portfolio")]
    [InlineData("/api/cashflow")]
    public async Task PortfolioManagerEndpoints_RequirePortfolioManagerRole(string endpoint)
    {
        // Arrange - Create client with Viewer role (not Portfolio Manager)
        var client = CreateClientWithRole("Viewer");

        // Act
        var response = await client.GetAsync(endpoint);

        // Assert - Should be forbidden
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [InlineData("/api/account/00000000-0000-0000-0000-000000000001/twr?from=2024-01-01&to=2024-12-31")]
    [InlineData("/api/account/00000000-0000-0000-0000-000000000001/contribution?from=2024-01-01&to=2024-12-31")]
    [InlineData("/api/account/00000000-0000-0000-0000-000000000001/risk?from=2024-01-01&to=2024-12-31")]
    [InlineData("/api/attribution/account/00000000-0000-0000-0000-000000000001?startDate=2024-01-01&endDate=2024-12-31")]
    [InlineData("/api/contribution/account/00000000-0000-0000-0000-000000000001?from=2024-01-01&to=2024-12-31")]
    public async Task AnalyticsEndpoints_RequireAnalystRole(string endpoint)
    {
        // Arrange - Create client with Viewer role (not Analyst)
        var client = CreateClientWithRole("Viewer");

        // Act
        var response = await client.GetAsync(endpoint);

        // Assert - Should be forbidden
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [InlineData("/api/tree")]
    [InlineData("/api/tree/current")]
    public async Task TreeEndpoints_AllowViewerRole(string endpoint)
    {
        // Arrange - Create client with Viewer role
        var client = CreateClientWithRole("Viewer");

        // Act
        var response = await client.GetAsync(endpoint);

        // Assert - Should NOT be forbidden (may be NotFound, BadRequest, or OK depending on data)
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AdminEndpoint_WithAdminRole_IsAccessible()
    {
        // Arrange
        var client = CreateClientWithRole("Admin");

        // Act
        var response = await client.GetAsync("/api/admin/data-summary");

        // Assert - Admin should have access
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task PortfolioManagerEndpoint_WithPortfolioManagerRole_IsAccessible()
    {
        // Arrange
        var client = CreateClientWithRole("PortfolioManager");

        // Act
        var response = await client.GetAsync("/api/client");

        // Assert - PortfolioManager should have access
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AnalyticsEndpoint_WithAnalystRole_IsAccessible()
    {
        // Arrange
        var client = CreateClientWithRole("Analyst");

        // Act - Try to access a contribution analysis endpoint
        var response = await client.GetAsync("/api/contribution/account/00000000-0000-0000-0000-000000000001?from=2024-01-01&to=2024-12-31");

        // Assert - Analyst should have access (may get NotFound for missing account, but not Forbidden)
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Endpoint_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange - Create client without authentication
        var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureTestServices(services =>
            {
                // Remove the existing database context
                var descriptors = services.Where(d =>
                    d.ServiceType == typeof(DbContextOptions<PortfolioContext>) ||
                    d.ServiceType == typeof(PortfolioContext)).ToList();

                foreach (var descriptor in descriptors)
                {
                    services.Remove(descriptor);
                }

                // Use in-memory database for tests
                services.AddDbContext<PortfolioContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDb_" + Guid.NewGuid());
                });
            });
        }).CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        // Act
        var response = await client.GetAsync("/api/client");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData("Admin", "/api/admin/data-summary")]
    [InlineData("PortfolioManager", "/api/client")]
    [InlineData("Analyst", "/api/contribution/account/00000000-0000-0000-0000-000000000001?from=2024-01-01&to=2024-12-31")]
    [InlineData("Viewer", "/api/tree")]
    public async Task RoleHierarchy_HigherRolesHaveAccess(string role, string endpoint)
    {
        // Arrange
        var client = CreateClientWithRole(role);

        // Act
        var response = await client.GetAsync(endpoint);

        // Assert - Should have access with their designated role
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    /// <summary>
    /// Helper method to create an HTTP client with a specific role authenticated
    /// </summary>
    private HttpClient CreateClientWithRole(string role)
    {
        var client = _factory.WithWebHostBuilder(builder =>
        {
            // Configure test environment FIRST - this prevents seeding from running
            builder.UseEnvironment("Testing");

            builder.ConfigureTestServices(services =>
            {
                // Remove the existing database context
                var descriptors = services.Where(d =>
                    d.ServiceType == typeof(DbContextOptions<PortfolioContext>) ||
                    d.ServiceType == typeof(PortfolioContext)).ToList();

                foreach (var descriptor in descriptors)
                {
                    services.Remove(descriptor);
                }

                // Use in-memory database for tests
                services.AddDbContext<PortfolioContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDb_" + Guid.NewGuid());
                    options.EnableSensitiveDataLogging();
                });

                // Remove Identity services since we're using test authentication
                var identityDescriptors = services.Where(d =>
                    d.ServiceType.Name.Contains("UserManager") ||
                    d.ServiceType.Name.Contains("RoleManager") ||
                    d.ServiceType.Name.Contains("SignInManager")).ToList();

                foreach (var descriptor in identityDescriptors)
                {
                    services.Remove(descriptor);
                }

                // Configure test authentication to replace JWT
                services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = "Test";
                    options.DefaultChallengeScheme = "Test";
                    options.DefaultScheme = "Test";
                })
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", options => { });
            });
        }).CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        // Add test authentication header with role
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test", role);

        return client;
    }
}

/// <summary>
/// Test authentication handler that creates authenticated users with specified roles
/// </summary>
public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        System.Text.Encodings.Web.UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Extract role from Authorization header
        var authHeader = Request.Headers.Authorization.ToString();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Test "))
        {
            return Task.FromResult(AuthenticateResult.Fail("No authorization header"));
        }

        var role = authHeader.Substring("Test ".Length);
        var userId = Guid.NewGuid();

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, $"test-user-{role}"),
            new Claim(ClaimTypes.Email, $"test-{role}@test.com"),
            new Claim(ClaimTypes.Role, role)
        };

        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "Test");

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
