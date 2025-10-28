import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Remove the env import that's causing issues
  reactStrictMode: true,
  
  // Optimize for smaller bundle size
  experimental: {
    optimizePackageImports: ['lucide-react', '@solana/wallet-adapter-react'],
  },
};

export default nextConfig;
