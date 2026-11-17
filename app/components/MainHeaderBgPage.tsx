"use client";

import React from "react";

export default function MainHeaderBgPage() {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className="absolute top-0 left-0 w-full h-15 md:h-20"
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#007BFF" />
          <stop offset="100%" stopColor="#00D1FF" />
        </linearGradient>
      </defs>

      <path
        fill="url(#gradient)"
        d="M0,160L120,144C240,128,480,96,720,96C960,96,1200,128,1320,144L1440,160V0H0Z"
      ></path>
    </svg>
  );
}
