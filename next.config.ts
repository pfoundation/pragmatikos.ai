import type { NextConfig } from 'next';
import path from 'node:path';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// Dev only: allow loading the dev server over the LAN. Without the origin host
// listed here, Next blocks the HMR websocket and React never hydrates — every
// client control (theme toggle, tabs) silently does nothing. Restart `bun run dev`
// after changing this. Extra hosts via NEXT_ALLOWED_DEV_ORIGINS (comma-separated).
const allowedDevOrigins = [
  '10.100.70.99',
  '127.0.0.1',
  ...(process.env.NEXT_ALLOWED_DEV_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
];

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  images: { unoptimized: true },
  turbopack: { root: path.resolve(import.meta.dirname ?? '.') },
  allowedDevOrigins,
};

export default nextConfig;
