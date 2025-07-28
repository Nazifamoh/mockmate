import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint errors from blocking production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors from blocking production builds
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
