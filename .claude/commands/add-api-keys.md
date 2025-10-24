# Add API Key Management

You are implementing **API Key Management** for programmatic access to the Time-Weighted Return application.

## Context
Allow users to generate API keys for programmatic access to the API. This enables integrations, automation, and third-party access without sharing user credentials.

## Implementation Requirements

### Domain Layer

- **Create ApiKey Entity:**
  - Properties: Id, OrganizationId, UserId (creator), Name, KeyHash (hashed), KeyPrefix (for display), Scopes (JSON array), IsActive, ExpiresAt, LastUsedAt, CreatedAt
  - Never store plain key - only bcrypt hash
  - KeyPrefix: First 8 chars for identification (e.g., "pk_live_12345...")

### Infrastructure Layer

- **Create API Key Service:**
  - `src/Infrastructure/Services/ApiKeyService.cs`
  - GenerateApiKey() - Create secure random key
  - HashApiKey() - Bcrypt hash for storage
  - ValidateApiKey() - Verify and return associated user/org

- **Create API Key Authentication Handler:**
  - `src/Infrastructure/Authentication/ApiKeyAuthenticationHandler.cs`
  - Check for `X-API-Key` header or `Authorization: Bearer <key>`
  - Validate key against database
  - Set user context from API key owner
  - Update LastUsedAt timestamp

- **Add Migration:**
  - ApiKeys table with indexes

### Application Layer

- **Create API Key Features:**
  - CreateApiKey command (returns plain key once)
  - GetApiKeys query (list user's keys - show prefix only)
  - RevokeApiKey command
  - UpdateApiKey command (rename, update scopes)

- **API Key Scopes:**
  - Define scopes: read:portfolios, write:portfolios, read:analytics, etc.
  - Enforce scopes in authorization policies

### API Layer

- **Create ApiKeyController:**
  - POST /api/apikeys - Create new API key
  - GET /api/apikeys - List user's API keys
  - DELETE /api/apikeys/{id} - Revoke API key
  - PUT /api/apikeys/{id} - Update API key (name, scopes)

- **Update Authentication:**
  - Register ApiKeyAuthenticationHandler
  - Add "ApiKey" authentication scheme
  - Support both JWT and API Key authentication

- **Rate Limiting:**
  - Apply stricter rate limits to API key requests
  - Track usage per API key

### Frontend

- **Create API Keys Page:**
  - `frontend/src/pages/ApiKeys.tsx`
  - Table showing user's API keys (name, prefix, created, last used)
  - Create new key button
  - Revoke key button

- **Create API Key Modal:**
  - `frontend/src/components/apikeys/CreateApiKeyModal.tsx`
  - Form: name, scopes, expiration
  - Show generated key ONCE with copy button
  - Warning: "Save this key - you won't see it again"

- **API Key Details:**
  - Show key prefix (pk_live_abc12345...)
  - Show last used timestamp
  - Show scopes
  - Show expiration date
  - Revoke button with confirmation

### Documentation

- Create API.md - API documentation for external developers
- Document authentication with API keys
- Document available scopes
- Provide cURL examples

### Testing

- Test API key generation creates secure random key
- Test API key authentication works
- Test key revocation
- Test scope enforcement
- Test rate limiting on API keys
- Test expired keys are rejected

## Acceptance Criteria
- [ ] ApiKey entity created
- [ ] ApiKeyService generates secure keys
- [ ] API key authentication handler working
- [ ] Keys are hashed (never store plain)
- [ ] CreateApiKey returns plain key once
- [ ] GetApiKeys returns list with prefixes only
- [ ] RevokeApiKey works
- [ ] Scope enforcement working
- [ ] ApiKeyController endpoints implemented
- [ ] Frontend API Keys page working
- [ ] Create key modal shows key once
- [ ] Copy key to clipboard working
- [ ] API documentation created
- [ ] All tests passing

## Related Files
- `src/Domain/Entities/ApiKey.cs` (NEW)
- `src/Infrastructure/Services/ApiKeyService.cs` (NEW)
- `src/Infrastructure/Authentication/ApiKeyAuthenticationHandler.cs` (NEW)
- `src/Application/Features/ApiKeys/` (NEW)
- `src/Api/Controllers/ApiKeyController.cs` (NEW)
- `src/Api/Program.cs`
- `frontend/src/pages/ApiKeys.tsx` (NEW)
- `frontend/src/components/apikeys/CreateApiKeyModal.tsx` (NEW)
- `API.md` (NEW)

## Implementation Notes
- Use cryptographically secure random generator
- Key format: `pk_live_` + 32 random chars
- Hash keys with bcrypt (work factor 12)
- Show key to user only once on creation
- Suggest key expiration (30 days, 90 days, 1 year, never)
- Consider IP whitelisting per key (future enhancement)
- Log all API key usage for security auditing

Execute this implementation end-to-end autonomously.
