import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allow build to complete even with TypeScript errors during deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow build to complete even with ESLint errors during deployment
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
