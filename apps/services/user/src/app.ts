import { Express } from "express";
import express from "express";
import cors from "cors";
import userRoutes from "@/routes/user";
import { env } from "@wohaai/env-ts";
import { userLogger as logger } from "@wohaai/telemetry";
import { connectUsersDB } from "./db";

const app: Express = express();

(async () => {
    await connectUsersDB(env.USERS_MONGO_URI);
    logger.info("✅ User Service connected to MongoDB" + env.USERS_MONGO_URI);
})();

// Middleware
app.use(
    cors({
        origin: env.CLIENT_ORIGIN,
        credentials: true,
    })
);

app.use(express.json());

// Routes
app.use("/", userRoutes);

// Health check route
app.get("/health", (_, res) => {
    if (env.NODE_ENV === "development") {
        res.status(200).send("👤 User Service is running.");
        return;
    };
    res.status(404)
    return;
});

export default app;