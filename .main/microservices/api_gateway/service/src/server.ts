import express, { Request, Response, NextFunction } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import cors from "cors";
import process from "process";

const app = express();
const PORT = process.env.API_GATEWAY_01;

const requiredEnvVars = [
  "API_GATEWAY_01",
  "ME_SERVICE_PORT",
  "SIGNIN_SERVICE_PORT",
  "SIGNUP_SERVICE_PORT",
  "VERIFY_USER_PORT",
  "CODE_MAILER_PORT",
  "VERIFY_CAPTCHA_PORT",
  "SIGNUP_VALIDATOR_PORT",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing environment variable: ${envVar}`);
    process.exit(1);
  }
}

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("/*splat", cors());

const logErrorHandler = (route: string) => (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`❌ [${route}] Proxy error:`, err.message);
  if (!res.headersSent) {
    res.status(500).json({ error: `Proxy error at ${route}: ${err.message}` });
  }
};

const proxy = (path: string, target: string) => {
  // Validate path to ensure it’s clean
  const cleanPath = path.trim();
  if (!cleanPath.startsWith("/")) {
    console.error(`Invalid path: ${cleanPath}. Path must start with '/'`);
    throw new Error(`Invalid path: ${cleanPath}`);
  }
  // Check for invalid characters that could confuse path-to-regexp
  if (/[:*?+()[\]]/.test(cleanPath)) {
    console.error(`Invalid characters in path: ${cleanPath}. Avoid :*?+()[] unless intentional`);
    throw new Error(`Invalid path: ${cleanPath}`);
  }
  console.log(`Setting up proxy: path=${cleanPath}, target=${target}`);
  if (!target.startsWith("http://")) {
    console.error(`Invalid target URL: ${target}`);
    throw new Error(`Target URL must start with http://, got: ${target}`);
  }
  try {
    return app.use(
      cleanPath,
      createProxyMiddleware({
        target,
        changeOrigin: true,
        logLevel: "debug",
        onError: logErrorHandler(cleanPath),
      } as Options)
    );
  } catch (err) {
    console.error(`Failed to set up proxy for path=${cleanPath}:`, err);
    throw err;
  }
};

// Define routes to Docker service names
const routes = [
  { path: "/me", target: `http://me_service:${process.env.ME_SERVICE_PORT}` },
  { path: "/signin", target: `http://signin_service:${process.env.SIGNIN_SERVICE_PORT}` },
  { path: "/signup", target: `http://signup_service:${process.env.SIGNUP_SERVICE_PORT}` },
  { path: "/verify_user", target: `http://verify_user_service:${process.env.VERIFY_USER_PORT}` },
  { path: "/code_mailer", target: `http://code_mailer_service:${process.env.CODE_MAILER_PORT}` },
  { path: "/verify_captcha", target: `http://verify_captcha_service:${process.env.VERIFY_CAPTCHA_PORT}` },
  { path: "/validate_signup", target: `http://signup_validator_service:${process.env.SIGNUP_VALIDATOR_PORT}` },
];

// Set up proxies with error handling
for (const { path, target } of routes) {
  try {
    proxy(path, target);
  } catch (err) {
    console.error(`Error setting up proxy for ${path}:`, err);
    process.exit(1);
  }
}

app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `The URL ${req.originalUrl} doesn't exist`,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running at http://localhost:${PORT}`);
});