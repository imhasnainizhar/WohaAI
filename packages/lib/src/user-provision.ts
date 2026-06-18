import axios, { AxiosInstance } from "axios";
import { randomUUID } from "crypto";
import { authLogger } from "@wohaai/telemetry";
import { InternalServerError, NormalizedError, ServiceError, ValidationError } from "@wohaai/errors";
import { env } from "@wohaai/env-ts";
import { ApiResponseBody } from "@wohaai/http";
import { UserCreatedResponse } from "@wohaai/types";

export interface UserProvisionParams {
    username: string;
    email: string;
    hashedPassword: string;
    authToken: string;
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
        params: UserProvisionParams
    ): Promise<UserCreatedResponse> {
        const requestId = randomUUID();

        try {
            authLogger.debug({
                message:
                    "[USER-PROVISIONING] Creating user",
                requestId,
                username: params.username,
                email: params.email,
            });

            authLogger.debug({
                message: `[USER-PROVISIONING] Creating user at ${env.USER_API_URI}/create/user`,
                requestId,
            });

            const headers: Record<string, string> = {
                "x-request-id": requestId,
            };

            if (params.authToken) {
                headers["Authorization"] = `Bearer ${params.authToken}`;
            }

            const response = await this.http.post(
                `${env.USER_API_URI}/create/user`,
                {
                    username: params.username,
                    email: params.email,
                    hashedPassword: params.hashedPassword,
                },
                {
                    headers,
                }
            );

            const body: ApiResponseBody<UserCreatedResponse> = response.data;
            authLogger.debug({
                message: "[USER-PROVISIONING] User creation response",
                requestId,
                body,
            });

            if (!body.data) {
                throw new InternalServerError(
                    "User creation failed - !body.data is true at user-provision client"
                );
            }

            return body.data;

            // const parsed =
            //     UserProvisionResponseSchema.safeParse(body.data);

            // if (!parsed.success) {
            //     authLogger.error({
            //         message:
            //             "[USER-PROVISIONING] Failed to parse user creation response",
            //         error:
            //             parsed.error,
            //     });
            //     throw new ValidationError("User creation failed");
            // }

            // return parsed.data as TUserProvisionResponse;
        } catch (err: any) {
            authLogger.error({
                message:
                    "[USER-PROVISIONING] Failed to create user",
                error: JSON.stringify({ error: err }),
            });

            if (err instanceof ServiceError) throw new NormalizedError(err)

            throw new InternalServerError(err)
        }
    }
}