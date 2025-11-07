# OpenRevenue Standalone App

A self-hosted revenue transparency platform that allows you to showcase your startup's metrics publicly while maintaining full control over your data.

## Features

- 🎯 **First-run onboarding flow** - Easy setup wizard for your startup details
- 🔐 **Secure authentication** - Login-protected dashboard with session management
- 📊 **Public revenue page** - TrustMRR-style public page showing your metrics
- 🔌 **Provider connections** - Connect payment processors (Stripe, etc.)
- 🔑 **API key management** - Generate keys for OpenRevenue platform integration
- 📈 **Privacy controls** - Choose what to show: exact amounts, ranges, or hidden
- 🎨 **Beautiful UI** - Modern, responsive interface built with React + Tailwind

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` and set your secrets:
- `JWT_SECRET` - For API key generation
- `SESSION_SECRET` - For web UI sessions

### 3. Initialize Database

```bash
pnpm db:init
```

### 4. Start Development Server

```bash
pnpm dev
```

This will start:
- Backend API server on `http://localhost:3001`
- Frontend dev server on `http://localhost:3002`

### 5. Complete Onboarding

Open `http://localhost:3002` and you'll be redirected to the onboarding flow:

1. **Step 1: Startup Details**
   - Enter your startup name, tagline, description
   - Add founder information
   - Set your website URL

2. **Step 2: Admin Account**
   - Create your admin username and password
   - This account is used to access the dashboard

### 6. Access Your Dashboard

After onboarding, you can:
- View the public page at `http://localhost:3002/`
- Login to dashboard at `http://localhost:3002/login`

## Development vs Production

### Development Mode

```bash
pnpm dev
```

Runs both backend and frontend with hot reload:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3002` (with API proxy)

### Production Build

```bash
# Build both backend and frontend
pnpm build

# Start production server
pnpm start
```

In production, the backend serves the built React app from a single port (`3001`).

## Routes

### Public Routes

- `/` - Public revenue page (no authentication required)
- `/login` - Login page for dashboard access

### Protected Routes (requires authentication)

- `/dashboard` - Overview and stats
- `/dashboard/connections` - Manage payment provider connections
- `/dashboard/api-keys` - Generate API keys for platform integration

### API Routes

All API routes are prefixed with `/api/v1`. See [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed authentication guide.

#### Public Endpoints (No Authentication)
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register (only during onboarding)
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/settings` - Get settings
- `GET /api/v1/settings/onboarding-status` - Check if onboarded
- `GET /api/v1/revenue/public-stats` - Public stats

#### Dual Auth Endpoints (Session OR API Key)
- `GET /api/v1/auth/me` - Check auth status
- `PUT /api/v1/settings` - Update settings
- `POST /api/v1/settings/complete-onboarding` - Complete onboarding
- `GET /api/v1/connections` - List connections
- `POST /api/v1/connections` - Create connection
- `GET /api/v1/connections/:id` - Get connection details
- `PATCH /api/v1/connections/:id` - Update connection
- `DELETE /api/v1/connections/:id` - Delete connection
- `GET /api/v1/api-keys` - List API keys
- `POST /api/v1/api-keys` - Create API key
- `DELETE /api/v1/api-keys/:id` - Revoke API key

#### API Key Only Endpoints (For Platform Integration)
- `GET /api/v1/revenue/current` - Current metrics
- `POST /api/v1/revenue` - Revenue data
- `POST /api/v1/revenue/signed` - Signed revenue data

## Authentication

The standalone app supports **two authentication methods**:

### 1. Session-Based Authentication (Web UI)
- Used by the web interface
- Login via username/password
- Secure HTTP-only cookies
- 7-day session duration

**Example:**
```typescript
// Login from web UI
await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ username: 'admin', password: 'password' }),
});
```

### 2. API Key Authentication (External Apps)
- Used by OpenRevenue platform and other apps
- JWT-based API keys
- Included in `X-API-Key` header
- Optional expiration dates

**Example:**
```bash
curl https://your-app.com/api/v1/connections \
  -H "X-API-Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Which endpoints use which auth?

- **Public endpoints**: No auth required (settings, public stats)
- **Dual auth endpoints**: Accept both session AND API key (connections, api-keys, dashboard data)
- **API key only**: Platform integration endpoints (revenue data sync)

📖 For complete authentication documentation, see [AUTHENTICATION.md](./AUTHENTICATION.md)

## Privacy Settings

Configure what's shown on your public page:

```typescript
{
  show_revenue: true,          // Show total revenue
  show_mrr: true,              // Show MRR
  show_arr: true,              // Show ARR
  show_customers: true,        // Show customer count
  revenue_display_mode: 'exact' // 'exact', 'range', or 'hidden'
}
```

- **exact**: Shows precise dollar amounts
- **range**: Shows ranges like "$5k - $10k"
- **hidden**: Hides the metric

## Database Schema

The app uses SQLite by default with the following tables:

- `settings` - Startup configuration and privacy settings
- `users` - Admin user accounts
- `sessions` - Web UI sessions
- `connections` - Payment provider connections
- `revenue_data` - Aggregated revenue data
- `sync_logs` - Sync history and status
- `api_keys` - Generated API keys

## Connecting Payment Providers

1. Log in to your dashboard
2. Go to "Connections"
3. Click "Add Connection"
4. Select your payment provider (Stripe, Paddle, etc.)
5. Enter your API credentials
6. Click "Connect"

The app will automatically sync your revenue data at the configured interval (default: 24 hours).

## Deploying

### Docker

```bash
# Build image
docker build -t openrevenue-standalone .

# Run container
docker run -p 3001:3001 \
  -v ./data:/app/data \
  -e JWT_SECRET=your-secret \
  -e SESSION_SECRET=your-secret \
  openrevenue-standalone
```

### Manual Deployment

1. Build the app:
   ```bash
   pnpm build
   ```

2. Copy these files to your server:
   - `dist/` directory
   - `node_modules/` directory
   - `.env` file (with production values)
   - `package.json`

3. Start the server:
   ```bash
   NODE_ENV=production node dist/index.js
   ```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `API_PORT` | No | `3001` | Server port |
| `JWT_SECRET` | Yes | - | Secret for API keys |
| `SESSION_SECRET` | Yes | - | Secret for sessions |
| `DATABASE_URL` | No | `file:./data/openrevenue.db` | SQLite database path |
| `SYNC_INTERVAL` | No | `24` | Hours between syncs |
| `WEB_UI_ENABLED` | No | `true` | Enable web UI |
| `ALLOWED_ORIGINS` | No | `*` | CORS origins |

## Troubleshooting

### Port Already in Use

If port 3001 or 3002 is already in use:

```bash
# Change API port
export API_PORT=3003

# Restart dev server
pnpm dev
```

### Database Locked

If you get a "database is locked" error:

```bash
# Stop all running instances
pkill -f "node dist/index.js"

# Restart
pnpm dev
```

### Can't Access Dashboard

1. Make sure you completed onboarding
2. Check if cookies are enabled
3. Try clearing browser cookies and logging in again

## Support

For issues and questions:
- GitHub: https://github.com/openrevenueorg/openrevenueorg
- Docs: https://docs.openrevenue.org

## License

MIT
