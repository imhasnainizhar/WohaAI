import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { CreateUserService } from '../services/create-user';
import { UserRepo } from '../repo/user-repo';
import { userLogger } from '@wohaai/telemetry';
import { User } from '@wohaai/db';
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

export class UserGrpcServer {
  private server: grpc.Server;
  private createUserService: CreateUserService;

  constructor() {
    this.server = new grpc.Server();
    const userRepo = new UserRepo(User);
    this.createUserService = new CreateUserService(userRepo);
  }

  start(port: number): void {
    // typing userProto as any here
    this.server.addService((userProto as any)?.UserService.service, {
      CreateUser: async (call: any, callback: any) => {
        try {
          userLogger.debug('gRPC CreateUser request received', call.request);

          const result = await this.createUserService.execute({
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

    this.server.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          userLogger.error(`❌ Failed to start gRPC server: ${error.message}`);
          return;
        }
        userLogger.info(`✅ User gRPC server running on port ${port}`);
      }
    );
  }

  stop(): void {
    this.server.tryShutdown((error) => {
      if (error) {
        userLogger.error(`❌ Error shutting down gRPC server: ${error.message}`);
      } else {
        userLogger.info('✅ User gRPC server shut down gracefully');
      }
    });
  }
}
