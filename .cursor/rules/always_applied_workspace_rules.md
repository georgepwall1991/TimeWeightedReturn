# Backend Architecture (.NET Core)

## Project Structure

```
/src
  /Domain        - Pure C# domain models and business logic
  /Infrastructure - EF Core, SQL Server, external data providers
  /Application   - MediatR handlers, DTOs, validators
  /Api           - Controllers/Minimal API endpoints
/tests
  /Domain.Tests     - Unit tests for business logic
  /Application.Tests - Integration tests with in-memory DB
  /Api.Tests        - API contract tests
```

## Core Domain Models

### Hierarchy Models

```csharp
class Client      { Guid Id; string Name; IList<Portfolio> Portfolios; }
class Portfolio   { Guid Id; string Name; IList<Account> Accounts; }
class Account     { Guid Id; string Name; IList<Holding> Holdings; }
```

### Position & Market Data

```csharp
class Holding     { Guid Id; Guid AccountId; Guid InstrumentId; DateOnly Date; decimal Units; }
class Price       { Guid InstrumentId; DateOnly Date; decimal Price; }
class FxRate      { string Base="GBP"; string Quote; DateOnly Date; decimal Rate; }
class Instrument  { Guid Id; string Ticker; InstrumentType Type; }

enum InstrumentType { Cash, Security }
```

## MediatR Pattern

- **Queries**: `GetHoldingsQuery`, `CalculateTwrQuery`, `GetPortfolioTreeQuery`
- **Commands**: `CreateClientCommand`, `AddHoldingCommand`, `UpdatePricesCommand`
- **Handlers**: Implement `IRequestHandler<TRequest, TResponse>`

## EF Core Configuration

- Code First approach
- Fluent API for entity configuration
- Repository pattern for data access
- DbContext with proper dependency injection

## Key Services

- `TimeWeightedReturnService` - Core TWR calculations
- `ContributionAnalysisService` - Performance contribution logic
- `AttributionAnalysisService` - Brinson-Fachler attribution
- `CurrencyConversionService` - Multi-currency support
- `PriceDataService` - Market data management

## Testing Strategy

- Unit tests for domain logic (no EF dependencies)
- Integration tests with LocalDB for development (TestContainers for CI)
- Use Respawn for database cleanup between tests
- FluentAssertions for readable test assertions

## Development Database Setup

```csharp
// Program.cs
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddDbContext<PortfolioContext>(options =>
        options.UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Database=PerformanceCalculationDb;Trusted_Connection=true;MultipleActiveResultSets=true"));
}
```

## Initial Migration Commands

```bash
# Create initial migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update

# Verify database creation
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "SELECT name FROM sys.databases WHERE name = 'PerformanceCalculationDb'"
```

# Documentation Maintenance Rule

## MDC (Markdown Documentation) Updates

**CRITICAL**: After completing each feature implementation or sprint, ALWAYS update the relevant MDC files to reflect the current state of the system.

### Required Updates After Each Sprint

1. **README.md** - Update sprint progress, API endpoints, and feature status
2. **Architecture rules** - Update domain models, services, and patterns if modified
3. **API documentation** - Add new endpoints with parameters and examples
4. **Database schema** - Document new entities, relationships, or migrations
5. **Testing documentation** - Update test coverage and testing patterns

### When to Update

- ✅ Immediately after feature completion
- ✅ Before moving to next sprint
- ✅ When adding new endpoints or services
- ✅ When modifying domain models or architecture
- ✅ After successful API testing and validation

### Documentation Standards

- Include working examples with actual data
- Document all query parameters and response formats
- Update sprint progress checkboxes
- Keep architectural diagrams current
- Maintain accurate test coverage metrics

### Accountability

Each sprint completion should include a documentation review to ensure all changes are properly documented for future development and team knowledge sharing.
