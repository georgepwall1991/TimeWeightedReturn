# Time-Weighted Return Application - Quick Start Guide

## Prerequisites
- .NET 8 SDK
- Node.js 18+
- Docker (for PostgreSQL)
- PostgreSQL client tools (optional)

## First Time Setup

### 1. Start Database
```bash
docker-compose up -d
```

### 2. Start Backend API
```bash
cd src/Api
dotnet run --urls "http://localhost:8080"
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:5173
- API: http://localhost:8080
- API Health: http://localhost:8080/health

## Default Credentials

### Admin User
- **Email:** admin@portfolioanalytics.com
- **Password:** Admin123!@#

## Running Tests

### E2E Tests (Playwright)
```bash
cd frontend

# All browsers
npm run test:e2e

# Specific browser
npm run test:e2e:chromium

# View report
npx playwright show-report
```

### Site Audit
```bash
cd frontend
npx tsx tests/audit/site-auditor.ts
```

## Common Tasks

### Reset Database
```bash
docker-compose down -v
docker-compose up -d
cd src/Api
dotnet ef database update
```

### Check Service Status
```bash
# API
curl http://localhost:8080/health

# Frontend
curl -I http://localhost:5173

# Database
docker exec twr-postgres pg_isready -U portfoliouser
```

### View Logs
```bash
# Docker logs
docker-compose logs -f

# Check ports
lsof -ti:8080  # API
lsof -ti:5173  # Frontend
lsof -ti:5432  # PostgreSQL
```

## Troubleshooting

### "Connection Refused" errors
1. Check all services are running
2. Verify ports are correct (8080 for API, 5173 for frontend)
3. Check .env file has correct API URL

### "Invalid credentials" on login
1. Verify database is running
2. Check admin user exists
3. Use correct email: admin@portfolioanalytics.com

### Tests failing
1. Restart dev servers to pick up .env changes
2. Clear test artifacts: `rm -rf test-results playwright-report`
3. Update browsers: `npx playwright install`

## Project Structure

```
TimeWeightedReturn/
├── src/
│   ├── Api/              # Backend API (.NET)
│   ├── Application/      # Business logic
│   ├── Domain/           # Domain models
│   └── Infrastructure/   # Data access
├── frontend/
│   ├── src/              # React app
│   ├── tests/            # Playwright tests
│   └── public/           # Static assets
├── docker-compose.yml    # Database setup
└── TEST_SUMMARY.md       # Detailed test documentation
```

## Configuration Files

### Backend
- `src/Api/appsettings.json` - Production config
- `src/Api/appsettings.Development.json` - Development config
- `src/Api/Properties/launchSettings.json` - Launch profiles

### Frontend
- `frontend/.env` - Environment variables
- `frontend/vite.config.ts` - Vite configuration
- `frontend/playwright.config.ts` - Test configuration

## Important Notes

1. **API Port:** Backend runs on port 8080 (not 5011)
2. **Environment Variables:** Restart dev server after changing .env
3. **Database:** Uses PostgreSQL in Docker (port 5432)
4. **Admin Password:** Admin123!@# (seed password from appsettings.json)

## Next Steps

1. Review TEST_SUMMARY.md for detailed test information
2. Run `npm run test:e2e` to verify setup
3. Explore the application at http://localhost:5173
4. Check API documentation at http://localhost:8080/swagger

## Support

For issues or questions:
1. Check TEST_SUMMARY.md for known issues
2. Review error logs in test-results/
3. Verify all services are running correctly
4. Ensure database has seed data

---

*Quick Start Guide v1.0 - Last Updated: 2025-10-25*
