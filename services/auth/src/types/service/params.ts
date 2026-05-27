import { ClientData } from "@packages/contracts/auth";
import { Cookie } from "@packages/http";

export interface SigninParams {
    usernameOrEmail: {
        type: "email"; value: string;
    } | {
        type: "username"; value: string;
    };
    password: string;
    clientData: ClientData;
}

export interface SignoutParams {
    userID: string;
    userSessionID: string;
}

export interface RefreshSessionParams {
    cookies: Cookie[];
    userIPAddress: string;
}