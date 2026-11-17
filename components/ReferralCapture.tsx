'use client';

import { useEffect } from 'react';

/** Remembers ?ref=CODE so it survives email verification and Google sign-in. */
export function ReferralCapture() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get('ref');
      if (ref && /^[A-Za-z0-9]{4,16}$/.test(ref)) localStorage.setItem('referral-code', ref.toUpperCase());
    } catch {
      /* storage unavailable */
    }
  }, []);
  return null;
}