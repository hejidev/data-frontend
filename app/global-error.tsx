'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'grid', minHeight: '100vh', placeItems: 'center', margin: 0 }}>
        <div style={{ textAlign: 'center', maxWidth: 420, padding: 24 }}>
          <h1 style={{ fontSize: 24 }}>Something went wrong</h1>
          <p style={{ color: '#64748b' }}>
            Your money is safe. Please reload the page. If the problem continues, contact support
            {error.digest ? ` and quote reference ${error.digest}` : ''}.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 12, padding: '10px 20px', borderRadius: 999, border: 0, background: '#0f766e', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}