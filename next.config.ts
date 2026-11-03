import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Aumenta o limite de payload do body para uploads de PDF
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
