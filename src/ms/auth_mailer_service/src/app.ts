import express, { Application, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import mailerRoutes from "@routes/mailer.route";
import { sendResponse } from "@utils/api_response";
import { logger } from "@utils/logger";

dotenv.config();

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/api/mailer", mailerRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  return sendResponse({
    res,
    success: false,
    statusCode: 404,
    message: "Route not found",
    errorType: "not_found",
    path: req.originalUrl,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error("🛑 Unhandled error", err);

  if (err.response) {
    return sendResponse({ res, ...err.response });
  }

  return sendResponse({
    res,
    success: false,
    statusCode: 500,
    message: "Internal server error",
    errorType: "internal_server_error",
    path: req.originalUrl,
  });
});

export default app;
