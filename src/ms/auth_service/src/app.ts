import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { json, urlencoded } from "body-parser";
// import { errorHandler } from "@middleware/error_handler"; // Centralized error handling middleware
import authRoutes from "@routes/auth.route"; // Auth-related endpoints (signup, signin, refresh token, etc.)
import { env } from "@config/env.config"; // Environment variables

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

app.use("/api/auth", authRoutes); // Mount auth-related routes under /api/auth

// This middleware should come last to catch all errors from above routes
// app.use(errorHandler);

export default app;
