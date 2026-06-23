import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The shared core ships as TypeScript source; Next transpiles it directly.
  transpilePackages: ['@findyourhostel/shared'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
