import axios, { AxiosInstance } from "axios";
import { randomUUID } from "crypto";
import { authLogger } from "@wohaai/telemetry";
import { InternalServerError, ValidationError } from "@wohaai/errors";
import { CreatedUserResponseSchema } from "@wohaai/validations";
import { env } from "@wohaai/env-ts";

export interface CreateUserParams {
    username: string;
    email: string;
    hashedPassword: string;
}

export interface CreatedUserResponse {
    userID: string;
    username: string;
    email: string;
}

export class UserProvisioningClient {
    private readonly http: AxiosInstance;

    constructor(baseURL: string) {
        this.http = axios.create({
            baseURL,
            timeout: 5000,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Creates user in User Service
     * (HTTP implementation — replaceable with gRPC later)
     */
    async createUser(
        params: CreateUserParams
    ): Promise<CreatedUserResponse> {
        const requestId = randomUUID();

        try {
            authLogger.debug({
                message:
                    "[USER-PROVISIONING] Creating user",
                requestId,
                username: params.username,
                email: params.email,
            });

            const response = await this.http.post(
                `${env.USER_API_URI}/create/user`,
                params,
                {
                    headers: {
                        "x-request-id": requestId,
                    },
                }
            );

            const data = CreatedUserResponseSchema.parse(response.data);

            if (!data.success) {
                throw new ValidationError("User creation failed");
            }

            return data.userData;
        } catch (err: any) {
            authLogger.error({
                message:
                    "[USER-PROVISIONING] Failed to create user",
                error:
                    err?.message || err,
            });

            throw new InternalServerError(err)
        }
    }
}