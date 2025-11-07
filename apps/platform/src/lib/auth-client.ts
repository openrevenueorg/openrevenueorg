import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from "better-auth/client/plugins";
import {
    adminClient,
    usernameClient,
    twoFactorClient,
    phoneNumberClient,
    magicLinkClient,
    organizationClient,
} from "better-auth/client/plugins";
import { auth } from './auth';

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5100',
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient(),
    usernameClient(),
    twoFactorClient(),
    phoneNumberClient(),
    magicLinkClient(),
    organizationClient(),
  ],
});




export const { signIn, signOut, signUp, useSession } = authClient;
