import {
    authMailerLogger,
} from "@wohaai/telemetry";

import { bootstrapServer }
    from "./bootstrap";



// START SERVER
authMailerLogger.debug(
    "✅ Initializing auth mailer server",
);

bootstrapServer();

authMailerLogger.debug(
    "✅ Server initialization complete",
);

// GRACEFUL SHUTDOWN
process.on(
    "SIGTERM",
    async () => {
        authMailerLogger.debug(
            "SIGTERM signal received",
        );

        authMailerLogger.warn(
            "SIGTERM received. Shutting down...",
        );

        process.exit(0);
    },
);

process.on(
    "SIGINT",
    async () => {
        authMailerLogger.debug(
            "SIGINT signal received",
        );

        authMailerLogger.warn(
            "⚠️ SIGINT received. Shutting down...",
        );

        process.exit(0);
    },
);

// UNHANDLED ERRORS
process.on(
    "unhandledRejection",
    (reason) => {
        authMailerLogger.debug(
            "Unhandled promise rejection detected",
        );

        authMailerLogger.fatal(
            {
                reason,
            },
            "❌ Unhandled Promise Rejection",
        );
    },
);

process.on(
    "uncaughtException",
    (error) => {
        authMailerLogger.debug(
            "Uncaught exception detected",
        );

        authMailerLogger.fatal(
            {
                error,
            },
            "❌ Uncaught Exception",
        );

        process.exit(1);
    },
);