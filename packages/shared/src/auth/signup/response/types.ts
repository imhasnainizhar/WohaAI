export type GetStartedResponseData = {
    identifierType: "username" | "email";
    identifier: string;
    already_exists: boolean;
};