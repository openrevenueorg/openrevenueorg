import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { prisma } from './prisma';
import { admin } from 'better-auth/plugins';
import { username } from 'better-auth/plugins';
import { anonymous } from 'better-auth/plugins';
import { haveIBeenPwned } from 'better-auth/plugins';
import { organization } from 'better-auth/plugins';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:5100',
  secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key-at-least-32-characters-long',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  user: {
		modelName: "user",
		additionalFields: {
      role: {
        type: "string",
        input: false
      },
		},
	},
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  plugins: [
    nextCookies(), // Must be last plugin for Next.js cookie handling
    admin({
      adminRoles: ["admin", "superadmin"],
    }),
    username(),
    anonymous({
            emailDomainName: "openrevenue.org"
    }),
    haveIBeenPwned({
      customPasswordCompromisedMessage: "Please choose a more secure password.",
    }),
    organization({
      allowUserToCreateOrganization: async (_user) => { 
        //const subscription = await getSubscription(user.id) 
        //return subscription.plan === "pro"
        return true;
      } ,
      teams: {
          enabled: true,
      }
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
