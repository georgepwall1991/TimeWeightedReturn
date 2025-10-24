using Hangfire.Dashboard;

namespace Api.Authorization;

public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    private readonly IWebHostEnvironment _environment;

    public HangfireAuthorizationFilter(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        // Allow access to authenticated users with Admin or PortfolioManager roles
        if (httpContext.User.Identity?.IsAuthenticated == true)
        {
            return httpContext.User.IsInRole("Admin") || httpContext.User.IsInRole("PortfolioManager");
        }

        // In development or Docker environments, allow unauthenticated access to Hangfire dashboard
        if (_environment.IsDevelopment() || _environment.IsEnvironment("Docker"))
        {
            return true;
        }

        return false;
    }
}
