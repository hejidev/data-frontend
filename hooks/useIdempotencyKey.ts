'use client';

import { useRef } from 'react';

/**
 * One key per purchase attempt. Keep it when a request fails with a network error
 * (so a retry can never double-charge) and rotate it once the server has answered.
 */
export function useIdempotencyKey() {
  const ref = useRef<string | null>(null);
  return {
    get: () => (ref.current ??= crypto.randomUUID()),
    rotate: () => {
      ref.current = null;
    },
  };
}