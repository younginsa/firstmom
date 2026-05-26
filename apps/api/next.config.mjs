import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@firstmom/shared'],
  // Pin Next's workspace root to the monorepo root so it doesn't get
  // confused by stray lockfiles elsewhere on the system.
  outputFileTracingRoot: path.join(__dirname, '../..'),
};

export default nextConfig;
