using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Api.Authorization;

/// <summary>
/// Requirement for client-level data access
/// </summary>
public class ClientAccessRequirement : IAuthorizationRequirement
{
    public Guid ClientId { get; }

    public ClientAccessRequirement(Guid clientId)
    {
        ClientId = clientId;
    }
}

/// <summary>
/// Handler that enforces client-level data isolation
/// Users can only access data for their assigned ClientId
/// Admins can access all clients
/// </summary>
public class ClientAuthorizationHandler : AuthorizationHandler<ClientAccessRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ClientAccessRequirement requirement)
    {
        // Check if user is authenticated
        if (!context.User.Identity?.IsAuthenticated ?? true)
        {
            return Task.CompletedTask;
        }

        // Admins can access all clients
        if (context.User.IsInRole("Admin"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Get user's ClientId from claims
        var userClientIdClaim = context.User.FindFirst("clientId");
        if (userClientIdClaim == null)
        {
            // User has no ClientId assigned - deny access
            return Task.CompletedTask;
        }

        if (Guid.TryParse(userClientIdClaim.Value, out var userClientId))
        {
            // User can only access their own client's data
            if (userClientId == requirement.ClientId)
            {
                context.Succeed(requirement);
            }
        }

        return Task.CompletedTask;
    }
}
