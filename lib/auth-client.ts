import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields, twoFactorClient } from 'better-auth/client/plugins';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
export const API_ORIGIN = new URL(API_URL).origin;

// If the server is unreachable or asleep, return a normal error instead of throwing (no endless spinners).
const safeFetch: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(40_000) });
  } catch {
    return new Response(JSON.stringify({ message: 'Cannot reach the server. Please try again.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const authClient = createAuthClient({
  baseURL: API_ORIGIN,
  fetchOptions: { customFetchImpl: safeFetch },
  plugins: [
    inferAdditionalFields({ user: { phone: { type: 'string', required: false } } }),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = '/auth/two-factor';
      },
    }),
  ],
});