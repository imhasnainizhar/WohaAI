import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import authRoutes from "@routes/auth";
import { env } from "@config/env";
import { connectRedis } from "@config/redis";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN, // Only allow requests from the frontend client
    credentials: true, // Allow cookies to be sent with requests
  })
);

app.use(cookieParser()); // Parse cookies from incoming requests
app.use(json()); // Parse JSON payloads from incoming requests
app.use(urlencoded({ extended: true })); // Parse URL-encoded payloads (e.g., form submissions)

(async () => {
  await connectRedis();
})();

app.use("/api/auth", authRoutes); // Mount auth-related routes under /api/auth

export default app;
