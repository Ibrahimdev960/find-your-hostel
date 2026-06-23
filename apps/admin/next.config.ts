import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@findyourhostel/shared'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
