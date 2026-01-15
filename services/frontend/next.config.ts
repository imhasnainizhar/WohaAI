import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import type { NextConfig } from "next";

const isDocker = fs.existsSync("/.dockerenv");
const isProduction = process.env.NODE_ENV === "production";

// Determine env path
const envPath = isDocker
  ? "/app/.env"                // Docker
  : path.resolve(__dirname, "../../.env"); // local monorepo

if (!isProduction) {
  const result = dotenv.config({ path: envPath });
  if (result.error) throw result.error;
  console.log(`✅ Loaded env from ${envPath}`);
}

// Validate env
const requiredEnv = [
  "NODE_ENV",
  "NEXT_PUBLIC_AUTH_API_URI",
  "NEXT_PUBLIC_AUTH_MAILER_API_URI",
  "NEXT_PUBLIC_USER_API_URI",
];

const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`❌ Missing env variables: ${missing.join(", ")}`);
}

const nextConfig: NextConfig = {
  devIndicators: false,
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = { poll: 1000, aggregateTimeout: 300 };
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
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)", // all routes
  //       headers: [
  //         {
  //           key: "Referrer-Policy",
  //           value: "no-referrer-when-downgrade", // OR: "origin-when-cross-origin"
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
