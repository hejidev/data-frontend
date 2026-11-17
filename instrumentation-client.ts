import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENV || process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  dataCollection: {
    cookies: false,
    httpHeaders: false,
    httpBodies: [],
  },
  // No Session Replay on purpose: this app has PIN and password fields.
  ignoreErrors: ['ResizeObserver loop', 'Failed to fetch', 'NetworkError', 'Load failed'],
  beforeSend(event, hint) {
    // Expected 4xx answers from our own API (wrong PIN, insufficient funds…) are not bugs.
    const err = hint.originalException as { name?: string; status?: number } | null;
    if (err && typeof err === 'object' && err.name === 'ApiError' && (err.status ?? 0) < 500) return null;
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;