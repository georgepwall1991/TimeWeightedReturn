using System.Text;
using Api.Authorization;
using Api.Configuration;
using Api.Middleware;
using Application;
using Application.Behaviors;
using Application.Features.Common.Interfaces;
using Application.Interfaces;
using Application.Jobs;
using Application.Services;
using Application.Services.MarketData;
using AspNetCoreRateLimit;
using Domain.Services;
using FluentValidation;
using Hangfire;
using Hangfire.MemoryStorage;
using Infrastructure.Data;
using Infrastructure.Identity;
using Infrastructure.Repositories;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using JwtSettings = Application.Services.JwtSettings;

var builder = WebApplication.CreateBuilder(args);

// Configure strongly-typed settings
builder.Services.Configure<PortfolioSettings>(builder.Configuration.GetSection(PortfolioSettings.SectionName));
builder.Services.Configure<CorsSettings>(builder.Configuration.GetSection(CorsSettings.SectionName));
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.Configure<IdentitySettings>(builder.Configuration.GetSection(IdentitySettings.SectionName));
builder.Services.Configure<AdminSeedSettings>(builder.Configuration.GetSection(AdminSeedSettings.SectionName));
builder.Services.Configure<Application.Services.EmailSettings>(builder.Configuration.GetSection(Application.Services.EmailSettings.SectionName));
builder.Services.Configure<MarketDataSettings>(builder.Configuration.GetSection(MarketDataSettings.SectionName));

// Add services to the container.
builder.Services.AddControllers();

// Add Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<PortfolioContext>();

// Add Problem Details for standardized error responses (RFC 7807)
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Configure Rate Limiting
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.Configure<IpRateLimitPolicies>(builder.Configuration.GetSection("IpRateLimitPolicies"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// Configure Entity Framework
builder.Services.AddDbContext<PortfolioContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Identity
var identitySettings = builder.Configuration.GetSection(IdentitySettings.SectionName).Get<IdentitySettings>() ?? new IdentitySettings();
builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
{
    // Password settings
    options.Password.RequireDigit = identitySettings.RequireDigit;
    options.Password.RequiredLength = identitySettings.RequiredLength;
    options.Password.RequireNonAlphanumeric = identitySettings.RequireNonAlphanumeric;
    options.Password.RequireUppercase = identitySettings.RequireUppercase;
    options.Password.RequireLowercase = identitySettings.RequireLowercase;

    // Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(identitySettings.LockoutMinutes);
    options.Lockout.MaxFailedAccessAttempts = identitySettings.MaxFailedAccessAttempts;
    options.Lockout.AllowedForNewUsers = true;

    // User settings
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<PortfolioContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>() ?? new JwtSettings();

// SECURITY: Validate JWT secret key in production
if (builder.Environment.IsProduction())
{
    const string defaultSecretKey = "your-secret-key-change-this-in-production-min-32-characters-long";
    if (string.IsNullOrWhiteSpace(jwtSettings.SecretKey) ||
        jwtSettings.SecretKey == defaultSecretKey ||
        jwtSettings.SecretKey.Length < 32)
    {
        throw new InvalidOperationException(
            "SECURITY ERROR: Invalid JWT SecretKey configuration detected in production. " +
            "The secret key must be at least 32 characters long and cannot be the default value. " +
            "Please configure a strong secret key via environment variables or user secrets.");
    }
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

// Add MediatR
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(AssemblyReference).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(PortfolioContext).Assembly); // Register Infrastructure handlers
});

// Add FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<AssemblyReference>();
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

// Configure Authorization Policies
builder.Services.AddAuthorization(options =>
{
    // Role-based policies
    options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
    options.AddPolicy("RequirePortfolioManagerRole", policy => policy.RequireRole("Admin", "PortfolioManager"));
    options.AddPolicy("RequireAnalystRole", policy => policy.RequireRole("Admin", "PortfolioManager", "Analyst"));
    options.AddPolicy("RequireViewerRole", policy => policy.RequireRole("Admin", "PortfolioManager", "Analyst", "Viewer"));
});

// Register authorization handlers
builder.Services.AddSingleton<IAuthorizationHandler, ClientAuthorizationHandler>();

// Add repositories and services
builder.Services.AddScoped<Application.Features.Common.Interfaces.IPortfolioRepository, PortfolioRepository>();
builder.Services.AddScoped<Application.Interfaces.IClientRepository, ClientRepository>();
builder.Services.AddScoped<Application.Interfaces.IPortfolioManagementRepository, PortfolioManagementRepository>();
builder.Services.AddScoped<Application.Interfaces.IAccountRepository, AccountRepository>();
builder.Services.AddScoped<Application.Interfaces.ICashFlowRepository, CashFlowRepository>();
builder.Services.AddScoped<Application.Interfaces.IBenchmarkRepository, BenchmarkRepository>();
builder.Services.AddScoped<Application.Interfaces.IUserPreferencesRepository, UserPreferencesRepository>();
builder.Services.AddScoped<ICurrencyConversionService, CurrencyConversionService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<Application.Services.IEmailService, Infrastructure.Services.EmailService>();
builder.Services.AddScoped<DataSeeder>();

// Register domain services
builder.Services.AddScoped<TimeWeightedReturnService>();
builder.Services.AddScoped<EnhancedTimeWeightedReturnService>();
builder.Services.AddScoped<ContributionAnalysisService>();
builder.Services.AddScoped<RiskMetricsService>();
builder.Services.AddScoped<AttributionAnalysisService>();

// Register market data providers and services
builder.Services.AddHttpClient<IMarketDataProvider, AlphaVantageProvider>();
builder.Services.AddHttpClient<IMarketDataProvider, FinnhubProvider>();
builder.Services.AddHttpClient<IMarketDataProvider, YahooFinanceProvider>();
builder.Services.AddScoped<IMarketDataService, MarketDataService>();
builder.Services.AddScoped<IPriceUpdateService, Infrastructure.Services.MarketData.PriceUpdateService>();
builder.Services.AddScoped<DailyPriceUpdateJob>();

// Configure Hangfire for background jobs
builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseMemoryStorage());

builder.Services.AddHangfireServer();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Time Weighted Return Portfolio Analytics API",
        Version = "v1",
        Description = "RESTful API for portfolio analytics with JWT authentication",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Portfolio Analytics Team",
            Email = "support@timeweightedreturn.com"
        }
    });

    // Add JWT Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Enable annotations
    options.EnableAnnotations();

    // Include XML comments if available
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

// Add CORS
var corsSettings = builder.Configuration.GetSection(CorsSettings.SectionName).Get<CorsSettings>() ?? new CorsSettings();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowConfiguredOrigins", policy =>
        policy.WithOrigins(corsSettings.AllowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();

// Use exception handler and status code pages for Problem Details
app.UseExceptionHandler();
app.UseStatusCodePages();

// Seed data in development and Docker environments (skip in testing environment)
if ((app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Docker")) && !app.Environment.IsEnvironment("Testing"))
{
    using var scope = app.Services.CreateScope();

    // Ensure database is created and migrated
    var dbContext = scope.ServiceProvider.GetRequiredService<PortfolioContext>();
    var contextLogger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        contextLogger.LogInformation("Applying database migrations...");
        await dbContext.Database.MigrateAsync();
        contextLogger.LogInformation("Database migrations applied successfully.");
    }
    catch (Exception ex)
    {
        contextLogger.LogError(ex, "An error occurred while migrating the database.");
        throw;
    }

    // Seed identity (roles and admin user)
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<IdentitySeeder>>();
    var adminSeedSettings = scope.ServiceProvider.GetRequiredService<IOptions<AdminSeedSettings>>().Value;

    var identitySeeder = new IdentitySeeder(
        userManager,
        roleManager,
        logger,
        adminSeedSettings.Email,
        adminSeedSettings.Password,
        adminSeedSettings.FirstName,
        adminSeedSettings.LastName,
        adminSeedSettings.EnableSeeding);
    await identitySeeder.SeedAsync();

    // Seed portfolio data
    var dataSeeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
    await dataSeeder.SeedAsync();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowConfiguredOrigins");

// Configure Hangfire Dashboard (requires authentication)
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireAuthorizationFilter(app.Environment) }
});

// Configure recurring jobs
var marketDataSettings = app.Services.GetRequiredService<IOptions<MarketDataSettings>>().Value;
if (marketDataSettings.EnableAutoUpdate)
{
    RecurringJob.AddOrUpdate<DailyPriceUpdateJob>(
        "daily-price-update",
        job => job.ExecuteAsync(),
        marketDataSettings.ScheduleCron,
        new RecurringJobOptions
        {
            TimeZone = TimeZoneInfo.Utc
        });
}

// Map health check endpoint
app.MapHealthChecks("/health");

// Use IP Rate Limiting
app.UseIpRateLimiting();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Make the implicit Program class accessible for testing
public partial class Program { }
