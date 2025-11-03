# Authentication Fixes - OpenRevenue Platform

## Summary
Fixed the authentication flow to properly integrate with NextAuth.js for OAuth-based login and registration.

## Issues Found

### 1. Static Login Page
**Problem**: The login page (`src/app/(auth)/login/page.tsx`) was a static HTML form with no actual authentication functionality. The form submission had no handler and OAuth buttons didn't work.

**Impact**: Users could not log in to the platform through any method.

### 2. Static Register Page
**Problem**: The register page (`src/app/(auth)/register/page.tsx`) had non-functional OAuth buttons and a disabled email/password form.

**Impact**: New users could not create accounts.

## Changes Made

### 1. Login Page (`src/app/(auth)/login/page.tsx`)
**File Location**: `apps/platform/src/app/(auth)/login/page.tsx`

**Changes**:
- Converted to client component with `'use client'` directive
- Integrated NextAuth `signIn()` for credentials authentication
- Added OAuth button handlers for Google and GitHub
- Implemented proper error handling and loading states
- Added redirect logic (successful login → `/dashboard`)

**Key Code**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
    } else if (result?.ok) {
      router.push('/dashboard');
      router.refresh();
    }
  } catch (err) {
    setError('An error occurred. Please try again.');
  } finally {
    setLoading(false);
  }
};

const handleOAuthSignIn = async (provider: 'google' | 'github') => {
  setLoading(true);
  try {
    await signIn(provider, { callbackUrl: '/dashboard' });
  } catch (err) {
    setError('Failed to sign in with ' + provider);
    setLoading(false);
  }
};
```

### 2. Register Page (`src/app/(auth)/register/page.tsx`)
**File Location**: `apps/platform/src/app/(auth)/register/page.tsx`

**Changes**:
- Converted to client component with `'use client'` directive
- Added working OAuth button handlers for Google and GitHub
- Made email/password form show "coming soon" message
- Implemented redirect logic (successful registration → `/dashboard/onboarding`)

**Key Code**:
```typescript
const handleOAuthSignIn = async (provider: 'google' | 'github') => {
  setLoading(true);
  try {
    await signIn(provider, { callbackUrl: '/dashboard/onboarding' });
  } catch (err) {
    setError('Failed to sign up with ' + provider);
    setLoading(false);
  }
};
```

## OAuth Setup Requirements

### Required Environment Variables

To enable OAuth authentication, you need to configure the following environment variables in your `.env.local` file:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local` file

### Setting Up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: OpenRevenue (or your choice)
   - Homepage URL: `http://localhost:3000` (development)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the Client ID and generate a Client Secret
6. Add both to your `.env.local` file

### Generating NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Current Authentication Status

### Working Features
- OAuth login with Google
- OAuth login with GitHub
- OAuth registration with Google
- OAuth registration with GitHub
- Proper error handling and user feedback
- Loading states during authentication
- Redirect to dashboard after login
- Redirect to onboarding after registration

### Not Yet Implemented
- Email/password registration (credentials provider not configured)
- Email/password login (credentials provider configured but not tested)
- Password reset functionality
- Email verification

## Testing the Authentication Flow

### Prerequisites
1. Environment variables configured in `.env.local`
2. Database running and migrations applied
3. Development server running (`pnpm dev`)

### Test Login Flow
1. Navigate to `http://localhost:3000/login`
2. Click "Google" or "GitHub" button
3. Complete OAuth authorization
4. Should redirect to `/dashboard`
5. Verify session is created in database

### Test Registration Flow
1. Navigate to `http://localhost:3000/register`
2. Click "Continue with Google" or "Continue with GitHub"
3. Complete OAuth authorization
4. Should redirect to `/dashboard/onboarding`
5. Verify new user and account records in database

## NextAuth Configuration

The NextAuth configuration is in `src/lib/auth.ts`:

```typescript
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  trustHost: true, // Required for production
};
```

## Database Schema

NextAuth requires these tables (already in Prisma schema):

- `User`: Stores user information
- `Account`: Stores OAuth provider accounts
- `Session`: Stores active sessions
- `VerificationToken`: For email verification tokens

## Troubleshooting

### Common Issues

**Issue**: "Configuration error: There is a problem with the server configuration"
**Solution**: Check that all required environment variables are set in `.env.local`

**Issue**: "Callback URL mismatch"
**Solution**: Ensure OAuth provider callback URLs match exactly:
- Google: `http://localhost:3000/api/auth/callback/google`
- GitHub: `http://localhost:3000/api/auth/callback/github`

**Issue**: "Database connection error"
**Solution**: Ensure PostgreSQL is running and DATABASE_URL is correct

**Issue**: Email/password login not working
**Solution**: This is expected - credentials provider is not fully configured yet

## Next Steps

To fully complete the authentication system:

1. **Configure Credentials Provider**: Add bcrypt hashing and user creation for email/password registration
2. **Add Email Verification**: Implement email verification flow using Resend
3. **Password Reset**: Add forgot password and reset password flows
4. **Session Management**: Add logout functionality throughout the app
5. **Protected Routes**: Ensure all dashboard routes require authentication
6. **User Profile**: Add user profile management page
7. **Account Linking**: Allow users to link multiple OAuth providers

## Related Files

- `apps/platform/src/lib/auth.ts` - NextAuth configuration
- `apps/platform/src/app/(auth)/login/page.tsx` - Login page
- `apps/platform/src/app/(auth)/register/page.tsx` - Register page
- `apps/platform/src/app/api/auth/[...nextauth]/route.ts` - NextAuth API handler
- `apps/platform/prisma/schema.prisma` - Database schema with NextAuth models
- `apps/platform/.env.example` - Example environment variables

## References

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Setup](https://next-auth.js.org/providers/google)
- [GitHub OAuth Setup](https://next-auth.js.org/providers/github)
- [Prisma Adapter](https://next-auth.js.org/adapters/prisma)
