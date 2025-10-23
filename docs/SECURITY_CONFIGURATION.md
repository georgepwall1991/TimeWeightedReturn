# Security Configuration Guide

## Overview
This document explains how to securely configure the Time Weighted Return Portfolio Analytics application for different environments.

## 🔐 Admin User Credentials

### Development Environment

**IMPORTANT:** Never commit credentials to source control!

#### Option 1: User Secrets (Recommended for Development)

```bash
# Navigate to the Api project directory
cd src/Api

# Initialize user secrets (if not already done)
dotnet user-secrets init

# Set admin credentials
dotnet user-secrets set "AdminSeed:Email" "admin@yourcompany.com"
dotnet user-secrets set "AdminSeed:Password" "YourSecurePassword123!"

# Verify secrets are set
dotnet user-secrets list
```

#### Option 2: Environment Variables

```bash
# Linux/macOS
export AdminSeed__Email="admin@yourcompany.com"
export AdminSeed__Password="YourSecurePassword123!"

# Windows PowerShell
$env:AdminSeed__Email="admin@yourcompany.com"
$env:AdminSeed__Password="YourSecurePassword123!"

# Windows CMD
set AdminSeed__Email=admin@yourcompany.com
set AdminSeed__Password=YourSecurePassword123!
```

### Production Environment

#### Azure App Service

```bash
# Using Azure CLI
az webapp config appsettings set \
  --resource-group <resource-group> \
  --name <app-name> \
  --settings \
    AdminSeed__Email="admin@yourcompany.com" \
    AdminSeed__Password="<secure-password>" \
    AdminSeed__EnableSeeding="false"
```

Or configure in Azure Portal:
1. Navigate to your App Service
2. Select **Configuration** > **Application settings**
3. Add the following settings:
   - `AdminSeed__Email`: Your admin email
   - `AdminSeed__Password`: Your secure password
   - `AdminSeed__EnableSeeding`: `false` (disable after first run)

#### AWS Elastic Beanstalk

```bash
# Using EB CLI
eb setenv \
  AdminSeed__Email="admin@yourcompany.com" \
  AdminSeed__Password="<secure-password>" \
  AdminSeed__EnableSeeding="false"
```

#### Docker / Kubernetes

```yaml
# kubernetes-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: admin-seed-secrets
type: Opaque
stringData:
  AdminSeed__Email: admin@yourcompany.com
  AdminSeed__Password: <secure-password>
  AdminSeed__EnableSeeding: "false"
```

```yaml
# deployment.yaml
env:
  - name: AdminSeed__Email
    valueFrom:
      secretKeyRef:
        name: admin-seed-secrets
        key: AdminSeed__Email
  - name: AdminSeed__Password
    valueFrom:
      secretKeyRef:
        name: admin-seed-secrets
        key: AdminSeed__Password
  - name: AdminSeed__EnableSeeding
    valueFrom:
      secretKeyRef:
        name: admin-seed-secrets
        key: AdminSeed__EnableSeeding
```

## 🔑 JWT Configuration

### Development

JWT settings are configured in `appsettings.Development.json`. The secret key should also be moved to user secrets:

```bash
dotnet user-secrets set "Jwt:SecretKey" "your-development-secret-key-min-32-characters-long"
```

### Production

**Critical:** Use a strong, randomly generated secret key (minimum 32 characters):

```bash
# Generate a secure random key
openssl rand -base64 32

# Or using PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Set as environment variable:

```bash
# Azure
az webapp config appsettings set \
  --name <app-name> \
  --settings Jwt__SecretKey="<generated-secret-key>"

# AWS
eb setenv Jwt__SecretKey="<generated-secret-key>"
```

## 🗄️ Database Connection Strings

### Development (SQLite)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=PerformanceCalculationDb.db"
  }
}
```

### Production (PostgreSQL - Recommended)

```bash
# User Secrets
dotnet user-secrets set "ConnectionStrings:DefaultConnection" \
  "Host=your-server.postgres.database.azure.com;Database=portfolio_analytics;Username=dbadmin;Password=<password>;SSL Mode=Require"

# Azure App Service
az webapp config connection-string set \
  --name <app-name> \
  --connection-string-type PostgreSQL \
  --settings DefaultConnection="Host=<server>;Database=<db>;Username=<user>;Password=<password>"
```

### Production (SQL Server)

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" \
  "Server=tcp:<server>.database.windows.net,1433;Database=portfolio_analytics;User ID=<username>;Password=<password>;Encrypt=True;TrustServerCertificate=False;"
```

## 🌐 Frontend Configuration

### Development

Create `frontend/.env.local` (NOT committed to git):

```env
VITE_API_URL=http://localhost:5011/api

# Only set to true for local development testing
VITE_SHOW_DEMO_CREDENTIALS=false

# If VITE_SHOW_DEMO_CREDENTIALS is true, these will be displayed
VITE_DEMO_EMAIL=admin@yourcompany.com
VITE_DEMO_PASSWORD=YourPassword123!
```

### Production

```bash
# Build with production API URL
VITE_API_URL=https://your-api.azurewebsites.net/api npm run build

# Never set these in production:
# VITE_SHOW_DEMO_CREDENTIALS should NOT be set
# VITE_DEMO_EMAIL should NOT be set
# VITE_DEMO_PASSWORD should NOT be set
```

## 🛡️ Security Checklist

### Before Production Deployment

- [ ] Remove all hardcoded credentials from source code
- [ ] Set strong, unique passwords (min 12 characters, mixed case, numbers, symbols)
- [ ] Use environment variables or secrets management for all sensitive data
- [ ] Generate new JWT secret key (minimum 32 characters)
- [ ] Set `AdminSeed:EnableSeeding` to `false` after initial setup
- [ ] Enable HTTPS only in production
- [ ] Configure CORS to allow only specific origins
- [ ] Set up database connection pooling and SSL
- [ ] Enable Application Insights or logging service
- [ ] Set up automated backups
- [ ] Configure rate limiting
- [ ] Review and apply authorization policies to all endpoints
- [ ] Remove demo credentials from frontend build
- [ ] Set secure cookie policies
- [ ] Enable security headers (HSTS, CSP, etc.)

### Ongoing Security

- [ ] Rotate JWT secret keys periodically (every 90 days)
- [ ] Rotate database passwords periodically
- [ ] Monitor authentication failures
- [ ] Review access logs regularly
- [ ] Keep dependencies updated
- [ ] Perform security audits
- [ ] Test backup restoration process

## 📚 Additional Resources

- [ASP.NET Core Security Best Practices](https://learn.microsoft.com/en-us/aspnet/core/security/)
- [User Secrets Documentation](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets)
- [Azure Key Vault](https://azure.microsoft.com/en-us/services/key-vault/)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)

## 🆘 Support

For security concerns or questions, please contact the security team or create a confidential issue in the repository.

---

**Last Updated:** 2025-10-23
**Version:** 1.0
