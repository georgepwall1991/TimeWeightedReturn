var builder = DistributedApplication.CreateBuilder(args);

// Add PostgreSQL database
var postgres = builder.AddPostgres("postgres")
    .WithDataVolume()
    .WithPgAdmin();

var portfoliodb = postgres.AddDatabase("portfoliodb");

// Add Redis cache
var redis = builder.AddRedis("redis");

// Add API project with dependencies
var api = builder.AddProject<Projects.Api>("api")
    .WithReference(portfoliodb)
    .WithReference(redis)
    .WaitFor(portfoliodb)
    .WaitFor(redis)
    .WithExternalHttpEndpoints();

// Add React frontend using npm (with automatic npm install)
var frontend = builder.AddNpmApp("frontend", "../../frontend", "dev")
    .WithHttpEndpoint(port: 5173, env: "PORT")
    .WaitFor(api)
    .WithExternalHttpEndpoints();

// Configure frontend proxy to API
frontend.WithEnvironment("VITE_API_URL", api.GetEndpoint("http"));

builder.Build().Run();
