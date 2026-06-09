import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import type { NextConfig } from "next";

const isDocker = fs.existsSync("/.dockerenv");
const isProduction = process.env.NODE_ENV === "production";

// Determine env path
const envPath = isDocker
  ? "/app/.env"
  : path.resolve(__dirname, "../../.env");

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
  serverExternalPackages: ["pino", "pino-http"],
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = { poll: 1000, aggregateTimeout: 300 };
    }
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@*": path.resolve(__dirname, "src/*")
    };
    return config;
  },
};

export default nextConfig;
