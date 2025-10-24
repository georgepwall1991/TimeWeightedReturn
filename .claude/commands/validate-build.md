# Validate Build

Comprehensive validation after feature implementation to ensure everything works.

## Implementation

Run a complete validation suite:

1. **Backend Validation:**
   ```bash
   # Restore dependencies
   dotnet restore

   # Build solution
   dotnet build

   # Run all tests
   dotnet test --verbosity normal

   # Check for warnings
   dotnet build /warnaserror

   # Format check
   dotnet format --verify-no-changes
   ```

2. **Frontend Validation:**
   ```bash
   # Install dependencies
   cd frontend && npm install

   # Type check
   npm run type-check (or npx tsc --noEmit)

   # Lint
   npm run lint

   # Run tests
   npm test

   # Build
   npm run build
   ```

3. **Database Validation:**
   - Check migrations are up to date
   - Validate database schema
   - Check for pending migrations

4. **API Validation:**
   - Start API locally
   - Hit health endpoint
   - Verify Swagger loads
   - Check for startup errors

5. **Integration Validation:**
   - Run integration tests
   - Check API endpoints respond correctly
   - Verify authentication works

6. **Report Results:**
   - ✅ Backend build: PASS/FAIL
   - ✅ Backend tests: X/Y passing
   - ✅ Frontend build: PASS/FAIL
   - ✅ Frontend tests: X/Y passing
   - ✅ Linting: PASS/FAIL
   - ✅ Type checking: PASS/FAIL
   - ❌ Issues found: [list issues]

7. **Fix Recommendations:**
   - If failures, suggest fixes
   - Link to error messages
   - Recommend commands to run

## Usage
```bash
/validate-build
```

## Options
```bash
/validate-build --skip-tests    # Skip test execution (faster)
/validate-build --backend-only  # Only validate backend
/validate-build --frontend-only # Only validate frontend
```

Execute this command after implementing features to ensure quality.
