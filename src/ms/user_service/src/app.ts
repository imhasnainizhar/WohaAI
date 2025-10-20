import express from "express";
import cors from "cors";
import userRoutes from "@routes/user.route";
import { env } from "@config/env.config";

const app = express();

// Middleware
app.use(
    cors({
        origin: env.CLIENT_ORIGIN,
        credentials: true,
    })
);

app.use(express.json());

// Routes
app.use("/api/user", userRoutes);

// Health check route
app.get("/", (_, res) => {
    if (env.NODE_ENV === "development") {
        res.status(200).send("👤 User Service is running.");
        return;
    };
    res.status(404)
    return;
});

export default app;