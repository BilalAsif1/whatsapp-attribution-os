import { createAuthClient } from 'better-auth/react';
import { organizationClient, twoFactorClient } from 'better-auth/client/plugins';

export const authClient: any = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  plugins: [organizationClient(), twoFactorClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
