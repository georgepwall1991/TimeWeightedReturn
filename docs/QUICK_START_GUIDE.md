# Quick Start Guide - Updated Authentication

## What Changed in This Session?

### 🔒 New Security Features
1. **Email Verification Required** - Users must verify their email before logging in
2. **Password Reset** - Complete forgot password workflow
3. **Rate Limiting** - Protection against brute force attacks (60 requests/minute)
4. **JWT Secret Validation** - Application won't start in production with weak secrets

### ⚠️ Breaking Changes
- **Registration now requires email verification** - Users can't log in until they verify their email
- **Auto-confirmed emails removed** - All new registrations need verification

---

## Development Setup

### 1. Start the Backend API

```bash
cd /Users/georgewall/RiderProjects/TimeWeightedReturn
dotnet run --project src/Api
```

The API will start on `https://localhost:5001` (or `http://localhost:5000`)

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## Testing New Features

### Testing Email Verification

#### Step 1: Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "TestP@ssw0rd123",
    "firstName": "New",
    "lastName": "User"
  }'
```

**Response:**
```json
{
  "message": "Registration successful. Please check your email to verify your account."
}
```

#### Step 2: Get Verification Token from Logs
Check the console where the API is running. You'll see:
```
Email verification token for newuser@example.com: ABC123XYZ...
```

#### Step 3: Verify Email
```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ABC123XYZ..."
  }'
```

#### Step 4: Login (Now Works!)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "TestP@ssw0rd123"
  }'
```

---

### Testing Password Reset

#### Step 1: Request Password Reset
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com"
  }'
```

#### Step 2: Get Reset Token from Logs
```
Password reset token for newuser@example.com: DEF456UVW...
```

#### Step 3: Reset Password
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "DEF456UVW...",
    "newPassword": "NewP@ssw0rd456"
  }'
```

#### Step 4: Login with New Password
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "NewP@ssw0rd456"
  }'
```

---

## Existing Admin Accounts

The following test accounts are seeded in development:

| Email | Password | Role |
|-------|----------|------|
| Set via user secrets | Set via user secrets | Admin |

**Note:** Admin credentials must be configured via user secrets. See `docs/SECURITY_CONFIGURATION.md` for setup instructions.

---

## Rate Limiting Behavior

### General Limits
- **60 requests per minute** per IP address
- **300 requests per 15 minutes** per IP address

### Localhost Exception
- **1000 requests per minute** for localhost (127.0.0.1)

### Testing Rate Limits
```bash
# This will trigger rate limiting after 60 requests
for i in {1..65}; do
  curl -X GET http://localhost:5000/api/health
  echo "Request $i"
done
```

Expected: Requests 61-65 return `429 Too Many Requests`

---

## Common Issues & Solutions

### Issue: "Please verify your email address before logging in"
**Cause:** Email not verified after registration
**Solution:** Check API logs for verification token and call `/api/auth/verify-email`

### Issue: "Invalid or expired verification token"
**Cause:** Token expired (7 days) or already used
**Solution:** Register again to get a new token

### Issue: "Invalid or expired reset token"
**Cause:** Password reset token expired (1 hour) or already used
**Solution:** Request a new password reset

### Issue: 429 Too Many Requests
**Cause:** Rate limit exceeded
**Solution:** Wait 1 minute and try again, or test from localhost

---

## API Endpoints Reference

### Authentication

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/register` | POST | No | Register new user |
| `/api/auth/verify-email` | POST | No | Verify email with token |
| `/api/auth/login` | POST | No | Login with email/password |
| `/api/auth/forgot-password` | POST | No | Request password reset |
| `/api/auth/reset-password` | POST | No | Reset password with token |
| `/api/auth/refresh` | POST | No | Refresh access token |
| `/api/auth/logout` | POST | Yes | Logout and revoke tokens |
| `/api/auth/me` | GET | Yes | Get current user info |

### Rate Limiting
- Health check endpoint (`/api/health`) is whitelisted
- All other endpoints have rate limits applied

---

## Next Steps

### For Development
1. **Frontend Integration:**
   - Update registration success message
   - Create email verification page
   - Create forgot password form
   - Create reset password page

2. **Email Service:**
   - Choose provider (SendGrid, AWS SES, etc.)
   - Create email templates
   - Update handlers to send actual emails

### For Production
1. **Environment Variables:**
   ```bash
   JWT__SecretKey="your-production-secret-min-32-chars"
   AdminSeed__Email="admin@yourcompany.com"
   AdminSeed__Password="SecureP@ssw0rd123"
   ```

2. **Email Configuration:**
   - Configure SMTP settings or email service API keys
   - Update email templates with branding
   - Test email delivery

3. **Rate Limiting:**
   - Adjust limits based on expected traffic
   - Configure Redis for distributed rate limiting (optional)
   - Monitor 429 responses

---

## Troubleshooting

### Check Application Logs
```bash
# In the API project directory
dotnet run --project src/Api --verbosity detailed
```

### Verify Database Migration
```bash
dotnet ef database update --project src/Infrastructure --startup-project src/Api
```

### Check Rate Limit Status
```bash
# Headers in response will show:
X-Rate-Limit-Limit: 60
X-Rate-Limit-Remaining: 45
X-Rate-Limit-Reset: 2025-10-23T10:30:00Z
```

---

## Resources

- **Full Documentation:** `docs/SESSION_IMPROVEMENTS_SUMMARY.md`
- **Security Configuration:** `docs/SECURITY_CONFIGURATION.md`
- **Architecture Overview:** `README.md`

---

**Updated:** 2025-10-23
**Version:** 2.0 (with email verification and password reset)
