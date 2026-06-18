import {
    authMailerLogger,
} from "@wohaai/telemetry";

import { bootstrapServer }
    from "./bootstrap";



// START SERVER
bootstrapServer();

// GRACEFUL SHUTDOWN
process.on(
    "SIGTERM",
    async () => {
        authMailerLogger.warn(
            "SIGTERM received. Shutting down...",
        );

        process.exit(0);
    },
);

process.on(
    "SIGINT",
    async () => {
        authMailerLogger.warn(
            "SIGINT received. Shutting down...",
        );

        process.exit(0);
    },
);

// UNHANDLED ERRORS
process.on(
    "unhandledRejection",
    (reason) => {
        authMailerLogger.fatal(
            {
                reason,
            },
            "Unhandled Promise Rejection",
        );
    },
);

process.on(
    "uncaughtException",
    (error) => {
        authMailerLogger.fatal(
            {
                error,
            },
            "Uncaught Exception",
        );

        process.exit(1);
    },
);