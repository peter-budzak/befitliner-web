import type { NextConfig } from "next";
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';

if (process.env.FITLINER_WEB_APP_ENABLED === 'true' &&
    !existsSync(path.join(process.cwd(), 'public/app/index.html'))) {
  throw new Error('Build the shared Flutter web app before enabling web login.');
}

// Keep local verification available, but do not publish against a known unsafe ACL.
if (process.env.NODE_ENV === 'production' && process.env.FITLINER_WEB_APP_ENABLED === 'true') {
  const reportPath = path.join(process.cwd(), 'docs/web-app-account-isolation.json');
  const report = existsSync(reportPath) ? JSON.parse(readFileSync(reportPath, 'utf8')) : null;
  if (!report || report.releaseBlocked !== false) {
    throw new Error('Web app release blocked: resolve profile data isolation and rerun the security preflight. See docs/web-app-profile-security.md.');
  }
  const manifestPath = path.join(process.cwd(), 'public/app/fitliner-build.json');
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : null;
  if (!manifest || manifest.profileIsolation !== true ||
      manifest.supabaseOrigin !== process.env.NEXT_PUBLIC_SUPABASE_URL ||
      new URL(manifest.supabaseOrigin).hostname.split('.')[0] !== report.project) {
    throw new Error('Web app release requires an isolated-profile build for the audited Supabase project.');
  }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [{source: '/app/:path*', headers: [
      {key: 'Cache-Control', value: 'private, no-store'},
      {key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive'},
      {key: 'Referrer-Policy', value: 'no-referrer'},
      {key: 'X-Frame-Options', value: 'SAMEORIGIN'},
      {key: 'Content-Security-Policy', value: "frame-ancestors 'self'"},
      {key: 'X-Content-Type-Options', value: 'nosniff'},
    ]}];
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
