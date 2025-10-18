import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { json, urlencoded } from "body-parser";
// import { errorHandler } from "@middleware/error_handler";
import { authRoutes } from "@routes/index";
import { env } from "@config/env.config";

const app = express();

// Middlewares
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(json());
app.use(urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

// Error handler (keep last)
// app.use(errorHandler);

export default app;
