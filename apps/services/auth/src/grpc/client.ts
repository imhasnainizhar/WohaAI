import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { authLogger } from '@wohaai/telemetry';
import { env } from '@wohaai/env-ts';
import { InternalServerError } from '@wohaai/errors';
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(__dirname, '../../../../../packages/proto/services/user/user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user;

export interface CreateUserGrpcRequest {
  username: string;
  email: string;
  hashed_password: string;
  auth_token?: string;
}

export interface CreateUserGrpcResponse {
  user_id: string;
  username: string;
  email: string;
}

export class UserGrpcClient {
  private client: any;

  constructor() {
    const userServiceHost = env.USER_SERVICE_HOST_NAME || 'localhost';
    const grpcPort = env.USER_GRPC_PORT || 50051;
    if (!userProto) {
      throw new InternalServerError('User proto not loaded');
    }
    // typing userProto as any here
    this.client = new (userProto as any).UserService(
      `${userServiceHost}:${grpcPort}`,
      grpc.credentials.createInsecure()
    );

    authLogger.info(`✅ User gRPC client connected to ${userServiceHost}:${grpcPort}`);
  }

  async createUser(request: CreateUserGrpcRequest): Promise<CreateUserGrpcResponse> {
    return new Promise((resolve, reject) => {
      authLogger.debug('gRPC CreateUser request' + request);

      this.client.CreateUser(request, (error: any, response: any) => {
        if (error) {
          authLogger.error('❌ gRPC CreateUser failed', error);
          reject(error);
        } else {
          authLogger.info('✅ gRPC CreateUser successful', response);
          resolve(response);
        }
      });
    });
  }
}