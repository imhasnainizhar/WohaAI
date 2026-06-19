import path from "path";
import type { NextConfig } from "next";
import "@wohaai/env-ts"

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["pino", "pino-pretty"],
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Only apply watchOptions for client-side builds
    if (!isServer) {
      config.watchOptions = { poll: 1000, aggregateTimeout: 300 };
    }
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/*": path.resolve(__dirname, "src/*")
    };
    return config;
  },
};

export default nextConfig;