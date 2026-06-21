import { userLogger } from "@wohaai/telemetry";
import app from "./app"
import { env } from "@wohaai/env-ts";
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { CreateUserService } from './services/create-user';
import { UserRepo } from './repo/user-repo';
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH =
    path.resolve(
        __dirname,
        '../../../../packages/proto/services/user/user.proto'
    );

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const PORT = env.USER_SERVICE_PORT
const GRPC_PORT = 50051

// Start HTTP server
app.listen(PORT, () => {
    userLogger.info(`✅ User Service HTTP server running on ${PORT}`)
})

// Start gRPC server
const grpcServer = new grpc.Server();
const userRepo = new UserRepo();
const userService = new CreateUserService(userRepo);

grpcServer.addService((userProto as any)?.UserService.service, {
    CreateUser: async (call: any, callback: any) => {
        try {
            userLogger.debug('gRPC CreateUser request received', call.request);

            const result = await userService.execute({
                username: call.request.username,
                email: call.request.email,
                hashedPassword: call.request.hashed_password,
            });

            userLogger.info('✅ gRPC CreateUser successful' + result);

            callback(null, {
                user_id: result.userID,
                username: result.username,
                email: result.email,
            });
        } catch (error: any) {
            userLogger.error('❌ gRPC CreateUser failed', error);
            callback(error, null);
        }
    },
});

grpcServer.bindAsync(
    `0.0.0.0:${GRPC_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            userLogger.error(`❌ Failed to start gRPC server: ${error.message}`);
            return;
        }
        userLogger.info(`✅ User gRPC server running on port ${GRPC_PORT}`);
    }
);

// Graceful shutdown
process.on('SIGTERM', () => {
    userLogger.info('⚠️ SIGTERM received. Shutting down...');
    grpcServer.tryShutdown((error) => {
        if (error) {
            userLogger.error(`❌ Error shutting down gRPC server: ${error.message}`);
        } else {
            userLogger.info('✅ User gRPC server shut down gracefully');
        }
    });
    process.exit(0);
});

process.on('SIGINT', () => {
    userLogger.info('⚠️ SIGINT received. Shutting down...');
    grpcServer.tryShutdown((error) => {
        if (error) {
            userLogger.error(`❌ Error shutting down gRPC server: ${error.message}`);
        } else {
            userLogger.info('✅ User gRPC server shut down gracefully');
        }
    });
    process.exit(0);
});