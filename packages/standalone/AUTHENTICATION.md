# Authentication Guide

The OpenRevenue Standalone App supports **two authentication methods** to handle both web UI access and programmatic API access.

## Authentication Methods

### 1. Session-Based Authentication (Web UI)

Used by the web interface for dashboard access.

**How it works:**
- User logs in via `/api/v1/auth/login`
- Server creates a session and sets a secure HTTP-only cookie
- Subsequent requests include the session cookie automatically
- Session expires after 7 days of inactivity

**Example Login:**
```typescript
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important: Include cookies
  body: JSON.stringify({
    username: 'admin',
    password: 'your-password',
  }),
});
```

**Logout:**
```typescript
await fetch('/api/v1/auth/logout', {
  method: 'POST',
  credentials: 'include',
});
```

### 2. API Key Authentication (External Apps)

Used by the OpenRevenue platform and other external applications.

**How it works:**
- Admin generates an API key from the dashboard
- External apps include the key in the `X-API-Key` header
- Server validates the JWT token
- API keys can have expiration dates

**Example Request:**
```bash
curl -X GET https://your-app.com/api/v1/connections \
  -H "X-API-Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**JavaScript Example:**
```typescript
const response = await fetch('https://your-app.com/api/v1/revenue/current', {
  headers: {
    'X-API-Key': 'your-api-key-here',
  },
});
```

## API Endpoints and Authentication

### Public Endpoints (No Authentication)

These endpoints are accessible without any authentication:

- `GET /api/v1/settings` - Get startup settings
- `GET /api/v1/settings/onboarding-status` - Check if onboarded
- `GET /api/v1/revenue/public-stats` - Public revenue statistics
- `GET /health` - Health check
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register (only during onboarding)
- `POST /api/v1/auth/logout` - Logout

### Dual Auth Endpoints (Session OR API Key)

These endpoints accept both session-based and API key authentication:

- `GET /api/v1/auth/me` - Check authentication status
- `PUT /api/v1/settings` - Update settings (after onboarding)
- `POST /api/v1/settings/complete-onboarding` - Complete onboarding
- `GET /api/v1/connections` - List connections
- `POST /api/v1/connections` - Create connection
- `GET /api/v1/connections/:id` - Get connection
- `PATCH /api/v1/connections/:id` - Update connection
- `DELETE /api/v1/connections/:id` - Delete connection
- `GET /api/v1/api-keys` - List API keys
- `POST /api/v1/api-keys` - Create API key
- `DELETE /api/v1/api-keys/:id` - Revoke API key

### API Key Only Endpoints

These endpoints ONLY accept API key authentication (for platform integration):

- `POST /api/v1/revenue` - Fetch revenue data
- `POST /api/v1/revenue/signed` - Fetch signed revenue data
- `GET /api/v1/revenue/current` - Get current metrics

## Middleware Implementation

The standalone app uses three authentication middlewares:

### 1. `verifyAuth` - Dual Authentication

Accepts both session and API key. Used for endpoints that should be accessible from both the web UI and external apps.

```typescript
import { verifyAuth } from '../middleware/auth';

router.get('/connections', verifyAuth, async (req, res) => {
  // Can be accessed with session cookie OR API key
  // req.authType will be 'session' or 'apikey'
  // req.userId contains the authenticated user ID
});
```

### 2. `verifyApiKey` - API Key Only

Only accepts API keys. Used for platform integration endpoints.

```typescript
import { verifyApiKey } from '../middleware/auth';

router.get('/revenue/current', verifyApiKey, async (req, res) => {
  // Can ONLY be accessed with API key
  // req.apiKey contains the API key
  // req.userId contains the user ID from the key
});
```

### 3. `optionalAuth` - Optional Authentication

Doesn't require authentication but extracts user info if provided.

```typescript
import { optionalAuth } from '../middleware/auth';

router.get('/some-route', optionalAuth, async (req, res) => {
  // Works with or without authentication
  // req.userId will be set if authenticated
});
```

## Onboarding Flow Authentication

During the initial onboarding, the app has special authentication rules:

1. **Not Onboarded:**
   - `PUT /api/v1/settings` - No auth required (for initial setup)
   - `POST /api/v1/auth/register` - Allowed (creates first admin)

2. **After Onboarding:**
   - `PUT /api/v1/settings` - Requires auth
   - `POST /api/v1/auth/register` - Blocked (403 Forbidden)

## Security Best Practices

### For Web UI Users

1. **Strong Passwords:** Use passwords with at least 6 characters (more recommended)
2. **HTTPS:** Always use HTTPS in production
3. **Logout:** Logout when done to invalidate session
4. **Session Timeout:** Sessions expire after 7 days

### For API Key Users

1. **Keep Keys Secret:** Never commit API keys to git
2. **Rotate Keys:** Regularly generate new keys and revoke old ones
3. **Expiration:** Set expiration dates on API keys
4. **Revoke Unused Keys:** Delete API keys that are no longer needed
5. **Transport Security:** Only send API keys over HTTPS

## Error Responses

### 401 Unauthorized
Returned when authentication is required but not provided:

```json
{
  "error": "Authentication required. Please provide a valid session or API key."
}
```

### 401 Invalid Token
Returned when an invalid API key is provided:

```json
{
  "error": "Invalid API key"
}
```

### 403 Forbidden
Returned when trying to register after onboarding:

```json
{
  "error": "Registration is only allowed during onboarding"
}
```

## Testing Authentication

### Testing Session Auth

```bash
# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"admin","password":"password"}'

# Use session
curl http://localhost:3001/api/v1/connections \
  -b cookies.txt

# Logout
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -b cookies.txt
```

### Testing API Key Auth

```bash
# Create API key (requires session)
curl -X POST http://localhost:3001/api/v1/api-keys \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"test-key"}'

# Use API key
curl http://localhost:3001/api/v1/connections \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

## Integration with OpenRevenue Platform

When connecting your standalone app to the main OpenRevenue platform:

1. Login to your standalone dashboard
2. Navigate to "API Keys"
3. Click "Generate New API Key"
4. Give it a name like "OpenRevenue Platform"
5. Copy the generated key
6. In the OpenRevenue platform, add your standalone app:
   - Enter your app's URL: `https://your-app.com`
   - Paste the API key
   - Click "Connect"

The platform will use this API key to fetch your revenue data periodically.

## Session Configuration

Sessions are configured in `src/index.ts`:

```typescript
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.env === 'production', // HTTPS only in production
      httpOnly: true,                       // Prevent XSS attacks
      maxAge: 1000 * 60 * 60 * 24 * 7,     // 7 days
    },
  })
);
```

## API Key Generation

API keys are JWT tokens signed with your `JWT_SECRET`:

```typescript
const token = jwt.sign(
  {
    id: keyId,
    name: keyName,
  },
  config.jwtSecret,
  {
    expiresIn: expiresIn || '90d', // Default 90 days
  }
);
```

The key is stored in the database as a hash for verification.
