# Docker Development Script for Time-Weighted Return Application (PowerShell)
# This script provides easy commands for Docker-based development on Windows

param(
    [Parameter(Mandatory=$false)]
    [string]$Command = "help",
    [Parameter(Mandatory=$false)]
    [string]$Service
)

$ErrorActionPreference = "Stop"

# Get script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Set-Location $ProjectRoot

# Color output functions
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Check if Docker is installed and running
function Test-Docker {
    try {
        docker info | Out-Null
    }
    catch {
        Write-Error "Docker is not running. Please start Docker Desktop."
        exit 1
    }
}

# Create .env file if it doesn't exist
function Initialize-Environment {
    if (-not (Test-Path .env)) {
        Write-Info "Creating .env file from .env.example..."
        Copy-Item .env.example .env
        Write-Success ".env file created. You can customize it if needed."
    }
}

# Start all services
function Start-Services {
    Write-Info "Starting all Docker services..."
    docker-compose up -d

    Write-Info "Waiting for services to be healthy..."
    Start-Sleep -Seconds 5

    Write-Success "Services started successfully!"
    Write-Info "Frontend: http://localhost:5173"
    Write-Info "API: http://localhost:8080"
    Write-Info "API Health: http://localhost:8080/api/health/ping"
    Write-Info "Swagger: http://localhost:8080/swagger"
}

# Stop all services
function Stop-Services {
    Write-Info "Stopping all Docker services..."
    docker-compose down
    Write-Success "Services stopped successfully!"
}

# Restart all services
function Restart-Services {
    Write-Info "Restarting all Docker services..."
    docker-compose restart
    Write-Success "Services restarted successfully!"
}

# Rebuild and start services
function Rebuild-Services {
    Write-Info "Rebuilding and starting Docker services..."
    docker-compose up -d --build
    Write-Success "Services rebuilt and started successfully!"
}

# View logs
function Show-Logs {
    param([string]$ServiceName)

    if ([string]::IsNullOrEmpty($ServiceName)) {
        docker-compose logs -f
    }
    else {
        docker-compose logs -f $ServiceName
    }
}

# Show status of services
function Show-Status {
    Write-Info "Docker services status:"
    docker-compose ps
}

# Clean up everything
function Clean-Docker {
    $response = Read-Host "This will remove all containers, volumes, and images. Are you sure? (y/N)"
    if ($response -match '^[yY](es)?$') {
        Write-Info "Cleaning up Docker resources..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        Write-Success "Cleanup completed!"
    }
    else {
        Write-Info "Cleanup cancelled."
    }
}

# Open a shell in a container
function Open-Shell {
    param([string]$ServiceName)

    if ([string]::IsNullOrEmpty($ServiceName)) {
        Write-Error "Please specify a service: api, frontend, or redis"
        exit 1
    }

    docker-compose exec $ServiceName sh
}

# Run database migrations
function Invoke-Migrations {
    Write-Info "Running database migrations..."
    docker-compose exec api dotnet ef database update --project /app/src/Infrastructure
    Write-Success "Migrations completed!"
}

# Show help
function Show-Help {
    @"
Docker Development Helper for Time-Weighted Return Application

Usage: .\docker-dev.ps1 -Command <command> [-Service <service>]

Commands:
    start       Start all Docker services
    stop        Stop all Docker services
    restart     Restart all Docker services
    rebuild     Rebuild and start all services
    logs        View logs (optionally specify -Service: api, frontend, redis)
    status      Show status of all services
    shell       Open shell in container (specify -Service: api, frontend, or redis)
    migrate     Run database migrations
    clean       Remove all containers, volumes, and images
    help        Show this help message

Examples:
    .\docker-dev.ps1 -Command start
    .\docker-dev.ps1 -Command logs -Service api
    .\docker-dev.ps1 -Command shell -Service frontend
    .\docker-dev.ps1 -Command rebuild

"@
}

# Main script logic
Test-Docker
Initialize-Environment

switch ($Command.ToLower()) {
    "start" {
        Start-Services
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Restart-Services
    }
    "rebuild" {
        Rebuild-Services
    }
    "logs" {
        Show-Logs -ServiceName $Service
    }
    "status" {
        Show-Status
    }
    "shell" {
        Open-Shell -ServiceName $Service
    }
    "migrate" {
        Invoke-Migrations
    }
    "clean" {
        Clean-Docker
    }
    "help" {
        Show-Help
    }
    default {
        Write-Error "Unknown command: $Command"
        Write-Host ""
        Show-Help
        exit 1
    }
}
