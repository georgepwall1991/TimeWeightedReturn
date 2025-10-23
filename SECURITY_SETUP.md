# Security Setup Guide

## Admin Credentials Configuration

### ⚠️ IMPORTANT: Never commit credentials to source control!

The application requires admin credentials to be configured for initial setup. Follow these instructions based on your environment.

---

## Development Environment

### Option 1: User Secrets (Recommended for local development)

1. Navigate to the API project directory:
```bash
cd src/Api
```

2. Initialize user secrets:
```bash
dotnet user-secrets init
```

3. Set admin credentials:
```bash
dotnet user-secrets set "AdminSeed:Email" "admin@timeweightedreturn.com"
dotnet user-secrets set "AdminSeed:Password" "YourSecurePassword123!"
```

4. (Optional) Customize admin name:
```bash
dotnet user-secrets set "AdminSeed:FirstName" "System"
dotnet user-secrets set "AdminSeed:LastName" "Administrator"
```

### Option 2: Environment Variables

Set these environment variables before running the application:

**Windows (PowerShell):**
```powershell
$env:AdminSeed__Email = "admin@timeweightedreturn.com"
$env:AdminSeed__Password = "YourSecurePassword123!"
```

**macOS/Linux (Bash):**
```bash
export AdminSeed__Email="admin@timeweightedreturn.com"
export AdminSeed__Password="YourSecurePassword123!"
```

**Note:** Use double underscores `__` for nested configuration in environment variables.

---

## Production Environment

### Azure App Service

1. Navigate to your App Service in the Azure Portal
2. Go to **Configuration** > **Application settings**
3. Add new settings:
   - Name: `AdminSeed__Email`, Value: `admin@yourcompany.com`
   - Name: `AdminSeed__Password`, Value: `[Use Azure Key Vault Reference]`
   - Name: `AdminSeed__EnableSeeding`, Value: `false` (after initial setup)

### Azure Key Vault Integration (Recommended)

1. Create a Key Vault secret for the admin password:
```bash
az keyvault secret set --vault-name YourVaultName --name AdminPassword --value "YourSecurePassword"
```

2. Reference the secret in App Service configuration:
```
@Microsoft.KeyVault(SecretUri=https://your-vault.vault.azure.net/secrets/AdminPassword/)
```

### AWS Elastic Beanstalk

1. Use AWS Secrets Manager:
```bash
aws secretsmanager create-secret \
    --name production/admin-password \
    --secret-string "YourSecurePassword"
```

2. Configure environment properties in `.ebextensions/environment.config`:
```yaml
option_settings:
  - namespace: aws:elasticbeanstalk:application:environment
    option_name: AdminSeed__Email
    value: admin@yourcompany.com
```

3. Retrieve secret in application startup (implement custom configuration provider)

### Docker / Kubernetes

**Docker Compose:**
```yaml
services:
  api:
    environment:
      - AdminSeed__Email=admin@yourcompany.com
      - AdminSeed__Password=${ADMIN_PASSWORD}
    env_file:
      - .env.production
```

**Kubernetes Secret:**
```bash
kubectl create secret generic admin-credentials \
  --from-literal=email=admin@yourcompany.com \
  --from-literal=password=YourSecurePassword
```

Reference in deployment:
```yaml
env:
  - name: AdminSeed__Email
    valueFrom:
      secretKeyRef:
        name: admin-credentials
        key: email
  - name: AdminSeed__Password
    valueFrom:
      secretKeyRef:
        name: admin-credentials
        key: password
```

---

## Configuration Options

### AdminSeed Settings

| Setting | Required | Default | Description |
|---------|----------|---------|-------------|
| `Email` | Yes | - | Admin user email address |
| `Password` | Yes | - | Admin user password (must meet Identity password requirements) |
| `FirstName` | No | "System" | Admin user first name |
| `LastName` | No | "Administrator" | Admin user last name |
| `EnableSeeding` | No | `true` | Set to `false` in production after initial setup |

### Password Requirements

The admin password must meet these criteria (configured in `appsettings.json` under `Identity`):
- Minimum 8 characters
- At least 1 digit
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 non-alphanumeric character

---

## Disabling Admin Seeding

After the admin user is created in production, **disable seeding** to prevent accidental recreation:

**User Secrets:**
```bash
dotnet user-secrets set "AdminSeed:EnableSeeding" "false"
```

**Environment Variable:**
```bash
export AdminSeed__EnableSeeding=false
```

**Configuration File (Production only):**
```json
{
  "AdminSeed": {
    "EnableSeeding": false
  }
}
```

---

## Security Best Practices

1. ✅ **Never commit credentials** to version control
2. ✅ **Use different passwords** for each environment
3. ✅ **Rotate credentials regularly** (every 90 days recommended)
4. ✅ **Use Azure Key Vault or AWS Secrets Manager** in production
5. ✅ **Disable seeding** after initial setup in production
6. ✅ **Force password change** on first login (implement custom policy)
7. ✅ **Enable MFA** for admin accounts in production
8. ✅ **Audit admin access** regularly
9. ✅ **Use strong, unique passwords** (minimum 16 characters recommended)
10. ✅ **Restrict admin access** to specific IP ranges if possible

---

## Troubleshooting

### "Admin email is required for seeding"
- Ensure `AdminSeed:Email` is configured
- Check configuration priority (User Secrets > Environment Variables > appsettings.json)
- Verify nested key format (use `__` in environment variables)

### "Admin password is required for seeding"
- Ensure `AdminSeed:Password` is configured
- Verify the password meets Identity requirements
- Check for special characters that might need escaping

### Admin user already exists
- The seeding process skips creation if the admin email already exists
- To reset, delete the user from the database and re-run seeding
- Or disable seeding with `EnableSeeding: false`

### Configuration not loading
- Check file names: `appsettings.Development.json` (case-sensitive on Linux)
- Verify JSON syntax
- Check environment variable naming (double underscores for nesting)
- Review application logs for configuration errors

---

## Example: Complete Setup for Development

```bash
# Navigate to API project
cd src/Api

# Initialize user secrets
dotnet user-secrets init

# Set all admin configuration
dotnet user-secrets set "AdminSeed:Email" "admin@timeweightedreturn.com"
dotnet user-secrets set "AdminSeed:Password" "DevPassword123!"
dotnet user-secrets set "AdminSeed:FirstName" "Dev"
dotnet user-secrets set "AdminSeed:LastName" "Admin"
dotnet user-secrets set "AdminSeed:EnableSeeding" "true"

# Verify configuration
dotnet user-secrets list

# Run the application
dotnet run
```

---

## Support

For security issues or questions:
- Review: [ASP.NET Core Configuration Documentation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/)
- Review: [Safe Storage of App Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets)
- Contact: security@timeweightedreturn.com (if applicable)
