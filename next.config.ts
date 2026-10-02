import type { NextConfig } from 'next';

/**
 * Baseline security headers (threat-model item 3). Low-risk set that does
 * not restrict script/style/connect origins; a full CSP is a separate step.
 *
 * HSTS omits `includeSubDomains` and `preload`: subdomains of the production
 * domain are hosted elsewhere and preload is hard to undo.
 */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: 'frame-ancestors \'none\'' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
