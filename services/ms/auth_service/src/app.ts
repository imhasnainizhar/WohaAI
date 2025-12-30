import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import authRoutes from "@routes/auth";
import { env } from "@config/env";
import { errorHandler } from "@middleware/async_handler";
import { createRedisClient } from "shared/clients/redis";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN, // Only allow requests from the frontend client
    credentials: true, // Allow cookies to be sent with requests
  })
);

// Parse cookies from incoming requests
app.use(cookieParser());

// Parse JSON payloads from incoming requests
app.use(json());

// Parse URL-encoded payloads (e.g., form submissions)
app.use(urlencoded({ extended: true }));

// Global error handler
app.use(errorHandler);

(async () => {
  await createRedisClient({
    url: env.AUTH_REDIS_STORE_URI,
    logger: {
      info: (msg: string) => console.log(msg),
      warn: (msg: string) => console.warn(msg),
      error: (msg: string) => console.error(msg),
    },
    exitOnFail: true,
  });
})();

// Mount auth-related routes under /api/auth
app.use("/api/auth", authRoutes);

export default app;
