import express from "express";
import cors from "cors";
import userRoutes from "@routes/user.route";

const app = express();

// Middleware
app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
        credentials: true,
    })
);

app.use(express.json());

// Routes
app.use("/api/user", userRoutes);

// Health check route
app.get("/", (_, res) => {
    if (process.env.NODE_ENV === "development") {
        res.status(200).send("👤 User Service is running.");
        return;
    };
    res.status(404)
    return;
});

export default app;