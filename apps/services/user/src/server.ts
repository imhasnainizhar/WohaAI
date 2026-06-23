import { userLogger } from "@wohaai/telemetry";
import app from "./app"
import { env } from "@wohaai/env-ts";
import { UserGrpcServer } from './grpc/server';
import { connectUsersDB } from "./db";

const PORT = env.USER_SERVICE_PORT;
const GRPC_PORT = env.USER_GRPC_PORT || 50051;

// Start servers after database connection
(async () => {
    try {
        await connectUsersDB(env.USERS_MONGO_URI);
        userLogger.info("✅ User Service connected to MongoDB");

        // Start HTTP server
        app.listen(PORT, () => {
            userLogger.info(`✅ User Service HTTP server running on port ${PORT}`);
        });

        // Start gRPC server
        const grpcServer = new UserGrpcServer();
        grpcServer.start(GRPC_PORT);

        // Graceful shutdown
        const shutdown = (signal: string) => {
            userLogger.info(`⚠️ ${signal} received. Shutting down...`);
            grpcServer.stop();
            process.exit(0);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (error) {
        userLogger.error('❌ Failed to start User Service' + error);
        process.exit(1);
    }
})();