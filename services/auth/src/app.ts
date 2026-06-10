import express, { Express } from "express";
import authRoutes from "@/routes/auth.js";
import { errorHandler } from "@/middlewares/error-handler";
import cors from "cors";
import cookieParser from "cookie-parser";
import { envConfigs } from "@packages/config";

const app: Express = express();

// Parse cookies from incoming requests
app.use(cookieParser());

// Parse JSON payloads from incoming requests
app.use(express.json());

// Parse URL-encoded payloads (e.g., form submissions)
app.use(express.urlencoded({ extended: true }));

// Global error handler
app.use(errorHandler);

const corsOptions = {
  origin: envConfigs.CLIENT_ORIGIN, // frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // if using cookies or auth headers
};

// Mount auth-related routes
app.use("/", cors(corsOptions), authRoutes);
app.use("/hi", cors(corsOptions), (req, res) => {
  res.json({status: 200, text: "hello"})
})

export default app;