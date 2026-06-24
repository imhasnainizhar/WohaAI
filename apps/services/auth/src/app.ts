import express, { Express } from "express";
import authRoutes from "@/routes/auth.js";
import { errorHandler } from "@/middlewares/error-handler";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "@wohaai/env-ts";

const app: Express = express();

// Parse cookies from incoming requests
app.use(cookieParser());

// Parse JSON payloads from incoming requests
app.use(express.json());

// Parse URL-encoded payloads (e.g., form submissions)
app.use(express.urlencoded({ extended: true }));

// Global error handler
app.use(errorHandler);

// CORS configuration - flexible for local development
const corsOptions = {
    origin: env.NODE_ENV === "development" ? true : (env.CLIENT_ORIGIN || "http://localhost:3000"),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true,
};

// Mount auth-related routes
app.use("/", cors(corsOptions), authRoutes);

export default app;