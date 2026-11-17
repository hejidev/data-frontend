import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields, twoFactorClient } from 'better-auth/client/plugins';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
// Better Auth lives at <api origin>/api/auth
export const API_ORIGIN = new URL(API_URL).origin;

export const authClient = createAuthClient({
  baseURL: API_ORIGIN,
  plugins: [
    inferAdditionalFields({ user: { phone: { type: 'string', required: false } } }),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = '/auth/two-factor';
      },
    }),
  ],
});