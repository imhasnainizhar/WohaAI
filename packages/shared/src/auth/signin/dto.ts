import { ClientData } from "@shared/common/auth/types";

export interface SigninDTO {
    usernameOrEmail: { type: "email" | "username"; value: string };
    password: string;
    clientData: ClientData;
}
