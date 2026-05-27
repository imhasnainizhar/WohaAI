import { ClientData } from "@packages/contracts/auth";

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