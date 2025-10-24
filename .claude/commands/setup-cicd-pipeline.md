# Setup CI/CD Pipeline

Create complete CI/CD pipeline with GitHub Actions for automated build, test, and deployment.

## CI Workflow (.github/workflows/ci.yml)
- Trigger: On pull request, push to main
- Jobs:
  1. Backend build and test (dotnet build, dotnet test)
  2. Frontend build and test (npm install, npm test, npm run build)
  3. Linting (dotnet format, eslint)
  4. Security scanning (Dependabot, Snyk)
  5. Code coverage reporting (Codecov)
  6. E2E tests (Playwright)
- Fail PR if tests fail or coverage drops

## CD Workflow (.github/workflows/cd.yml)
- Trigger: On push to main (after CI passes)
- Jobs:
  1. Build Docker images
  2. Push to container registry
  3. Deploy to staging environment
  4. Run smoke tests
  5. Deploy to production (manual approval)
  6. Health check validation

## Branch Protection
- Require CI to pass before merge
- Require code review
- Prevent force push to main

Execute end-to-end autonomously.
