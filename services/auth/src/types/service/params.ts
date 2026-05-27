import { ClientData } from "@packages/contracts/auth";
import { Cookie } from "@packages/http";

export interface SigninParams {
    usernameOrEmail: {
        type: "username"; value: string;
    } | {
        type: "email"; value: string;
    };
    password: string;
    clientData: ClientData;
}

export interface SignoutParams {
    userID: string;
    userSessionID: string;
}

export interface RefreshSessionParams {
    refreshToken: string;
    userIPAddress: string;
}

export interface SignupInitParams {
    usernameOrEmail: {
        type: "username"; value: string;
    } | {
        type: "email"; value: string;
    };
}