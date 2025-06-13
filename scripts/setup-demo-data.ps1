# Portfolio Analytics Demo Setup Script
# This script sets up the database and comprehensive demo data

Write-Host "🚀 Setting up Portfolio Analytics Demo Environment..." -ForegroundColor Green

# Function to check if SQL Server is running
function Test-SqlServer {
    try {
        $result = sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "SELECT 1" 2>$null
        return $LASTEXITCODE -eq 0
    }
    catch {
        return $false
    }
}

# Check dependencies
Write-Host "🔍 Checking dependencies..." -ForegroundColor Yellow

# Check .NET
$dotnetVersion = dotnet --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ .NET SDK not found. Please install .NET 8 SDK" -ForegroundColor Red
    exit 1
}
Write-Host "✅ .NET SDK: $dotnetVersion" -ForegroundColor Green

# Check SQL Server LocalDB
if (-not (Test-SqlServer)) {
    Write-Host "❌ SQL Server LocalDB not available. Please install SQL Server LocalDB" -ForegroundColor Red
    exit 1
}
Write-Host "✅ SQL Server LocalDB is running" -ForegroundColor Green

# Build the solution
Write-Host "🔨 Building solution..." -ForegroundColor Yellow
dotnet build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Solution built successfully" -ForegroundColor Green

# Apply database migrations
Write-Host "📊 Setting up database..." -ForegroundColor Yellow
dotnet ef database update --project src/Infrastructure
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database migration failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database migrations applied" -ForegroundColor Green

# Run seed data script
Write-Host "🌱 Loading comprehensive demo data..." -ForegroundColor Yellow
$seedDataPath = Join-Path $PSScriptRoot "comprehensive-seed-data.sql"

if (-not (Test-Path $seedDataPath)) {
    Write-Host "❌ Seed data script not found: $seedDataPath" -ForegroundColor Red
    exit 1
}

try {
    sqlcmd -S "(localdb)\MSSQLLocalDB" -d "PerformanceCalculationDb" -i $seedDataPath
    if ($LASTEXITCODE -ne 0) {
        throw "SQL script execution failed"
    }
    Write-Host "✅ Demo data loaded successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to load seed data: $_" -ForegroundColor Red
    exit 1
}

# Verify data
Write-Host "🔍 Verifying demo data..." -ForegroundColor Yellow
$verificationQueries = @(
    "SELECT COUNT(*) as Clients FROM Clients",
    "SELECT COUNT(*) as Portfolios FROM Portfolios",
    "SELECT COUNT(*) as Accounts FROM Accounts",
    "SELECT COUNT(*) as Instruments FROM Instruments",
    "SELECT COUNT(*) as Holdings FROM Holdings",
    "SELECT COUNT(*) as Prices FROM Prices",
    "SELECT COUNT(*) as FxRates FROM FxRates"
)

foreach ($query in $verificationQueries) {
    try {
        $result = sqlcmd -S "(localdb)\MSSQLLocalDB" -d "PerformanceCalculationDb" -Q $query -h -1
        if ($result -match '\d+') {
            $count = [int]($result -replace '\D', '')
            $table = $query -replace "SELECT COUNT\(\*\) as (\w+) FROM \w+", '$1'
            Write-Host "✅ $table`: $count records" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️  Could not verify $query" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Demo environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What's included:" -ForegroundColor Cyan
Write-Host "   • 3 clients with realistic names (Smith Family Trust, Johnson Pension Fund, Williams Investment Partnership)" -ForegroundColor White
Write-Host "   • 4 portfolios with different strategies" -ForegroundColor White
Write-Host "   • 7 accounts across GBP, USD, and EUR currencies" -ForegroundColor White
Write-Host "   • 16 instruments (Cash, UK/US/EU equities, ETFs)" -ForegroundColor White
Write-Host "   • 12 months of realistic price and FX data" -ForegroundColor White
Write-Host "   • Current and historical holdings for TWR calculations" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Start the API:     dotnet run --project src/Api" -ForegroundColor Yellow
Write-Host "   2. Start the frontend: cd frontend && pnpm dev" -ForegroundColor Yellow
Write-Host "   3. Open browser:      http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "🧪 Test scenarios:" -ForegroundColor Cyan
Write-Host "   • Navigate the portfolio tree to see all clients and accounts" -ForegroundColor White
Write-Host "   • Select any account and calculate TWR for different periods" -ForegroundColor White
Write-Host "   • View holdings breakdown with cash vs securities" -ForegroundColor White
Write-Host "   • Test multi-currency conversion (USD and EUR accounts)" -ForegroundColor White
Write-Host ""
Write-Host "📊 Sample API calls to test:" -ForegroundColor Cyan
Write-Host "   GET /api/tree                    # Get full portfolio tree" -ForegroundColor Gray
Write-Host "   GET /api/account/{id}/twr        # Calculate TWR for an account" -ForegroundColor Gray
Write-Host "   GET /api/portfolio/{id}/holdings # Get portfolio holdings" -ForegroundColor Gray
