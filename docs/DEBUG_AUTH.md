# Debugging Better Auth 404 Error

## Issue
`GET /api/auth/session` returns 404

## Possible Causes & Solutions

### 1. Database Tables Don't Exist

Better Auth needs its tables in the database. Run:

```bash
cd apps/platform

# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# OR run migrations
npx prisma migrate dev --name add_better_auth_tables
```

### 2. Test the API Route Directly

Visit these URLs in your browser to test:

- `http://localhost:5100/api/auth/session` - Should return session data or null
- `http://localhost:5100/api/auth/sign-in/email` - Should return sign-in info

### 3. Check Better Auth Configuration

The configuration needs:
- ✅ `baseURL` - Set to `http://localhost:5100`
- ✅ `secret` - Set from `BETTER_AUTH_SECRET` env var
- ✅ `database` - Configured with Prisma adapter
- ⚠️  Database tables must exist

### 4. Verify Environment Variables

Make sure these are in your `.env.local`:

```bash
DATABASE_URL=postgresql://openrevenue:development@localhost:5432/openrevenue
NEXTAUTH_URL=http://localhost:5100
BETTER_AUTH_SECRET=iegmmeypS0gApIgbCoM9qBVWbMYgNVzi
NEXT_PUBLIC_APP_URL=http://localhost:5100

# OAuth (optional for testing)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 5. Check Database Connection

Test PostgreSQL connection:

```bash
# Try to connect to PostgreSQL
psql postgresql://openrevenue:development@localhost:5432/openrevenue -c "SELECT 1;"

# If it fails, check:
# - Is PostgreSQL running?
# - Are credentials correct?
# - Does the database exist?
```

### 6. Check if Tables Exist

```bash
npx prisma studio
# Then navigate to the database and check if User, Account, Session tables exist
```

### 7. Restart Dev Server

After running migrations:

```bash
# Stop all dev servers (Ctrl+C)

# Start fresh
cd apps/platform
pnpm dev
```

### 8. Check Console for Better Auth Errors

Look for errors in the terminal where `pnpm dev` is running. Better Auth will log database connection errors or configuration issues.

### 9. Test with curl

```bash
# Test session endpoint
curl http://localhost:5100/api/auth/session

# Should return:
# {"user":null,"session":null}
# OR proper session data if logged in

# Test if API route exists
curl -v http://localhost:5100/api/auth/session 2>&1 | grep "HTTP"
# Should show "HTTP/1.1 200" not "HTTP/1.1 404"
```

### 10. Common Fixes

**If you see "Table does not exist" errors:**
```bash
npx prisma db push --force-reset  # WARNING: Deletes all data!
# Or safer:
npx prisma migrate dev
```

**If route still 404s:**
1. Delete `.next` folder: `rm -rf .next`
2. Restart dev server: `pnpm dev`

**If database connection fails:**
1. Start PostgreSQL
2. Verify DATABASE_URL in .env.local
3. Test connection: `npx prisma db pull`

## Quick Fix Steps

Try these in order:

1. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

2. **Push schema to database:**
   ```bash
   npx prisma db push
   ```

3. **Delete Next.js cache:**
   ```bash
   rm -rf .next
   ```

4. **Restart dev server:**
   ```bash
   pnpm dev
   ```

5. **Test endpoint:**
   ```bash
   curl http://localhost:5100/api/auth/session
   ```

If you still get 404, check the terminal output for specific error messages and share them.
