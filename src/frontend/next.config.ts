import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },


  webpack: (config, {isServer}) => {
    if (!isServer) {
      config.watchOptions = {
        poll: 1000, // Check for changes every 1000ms
        aggregateTimeout: 300,
      }
    }
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@lib": path.resolve(__dirname, "src/lib"),
      "@models": path.resolve(__dirname, "src/models"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@components": path.resolve(__dirname, "src/components"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@app": path.resolve(__dirname, "src/app"),
      "@providers": path.resolve(__dirname, "src/providers"),
    };
    return config;
  },
};

export default nextConfig;
