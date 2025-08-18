using Application;
using Domain.Interfaces;
using Application.Services;
using Domain.Services;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Hangfire;
using Hangfire.MemoryStorage;
using MediatR;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Add Hangfire services.
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseMemoryStorage());

// Add the Hangfire server.
builder.Services.AddHangfireServer();

// Configure Entity Framework
builder.Services.AddDbContext<PortfolioContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(AssemblyReference).Assembly));

// Add repositories and services
builder.Services.AddScoped<IPortfolioRepository, PortfolioRepository>();
builder.Services.AddScoped<ICurrencyConversionService, CurrencyConversionService>();
builder.Services.AddScoped<IHoldingMapperService, HoldingMapperService>();
builder.Services.AddScoped<DataSeeder>();

// Register domain services
builder.Services.AddScoped<TimeWeightedReturnService>();
builder.Services.AddScoped<ContributionAnalysisService>();
builder.Services.AddScoped<RiskMetricsService>();
builder.Services.AddScoped<AttributionAnalysisService>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS for development
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentCors", policy =>
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173") // React dev servers
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();

// Seed data in development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
    await seeder.SeedAsync();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("DevelopmentCors");
    app.UseHangfireDashboard();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
