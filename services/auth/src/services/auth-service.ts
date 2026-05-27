import { AuthRepo } from "@/repo/auth-repo";
import { prisma } from "@packages/prisma";
import { SigninService } from "./signin";
import { SignoutService } from "./signout";
import { RefreshSessionService } from "./refresh-session";

import { SigninParams, SignoutParams } from "@/types/service/params";

class AuthService {
    private static instance: AuthService;

    private constructor(
        private readonly signinService: SigninService,
        private readonly refreshSessionService: RefreshSessionService,
        private readonly signoutService: SignoutService,
        private readonly authRepo: AuthRepo
    ) {}

    /**
     * Singleton accessor
     */
    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            const authRepo = new AuthRepo(prisma);

            const signinService = new SigninService(
                authRepo
            );

            const refreshSessionService =
                new RefreshSessionService(authRepo);

            const signoutService =
                new SignoutService(authRepo);

            AuthService.instance = new AuthService(
                signinService,
                refreshSessionService,
                signoutService,
                authRepo
            );
        }

        return AuthService.instance;
    }

    public async signin({
        usernameOrEmail,
        password,
        clientData,
    }: SigninParams) {
        return this.signinService.execute({
            usernameOrEmail,
            password,
            clientData,
        });
    }

    public async signout({
        userID,
        userSessionID
    }: SignoutParams) {
        return this.signoutService.execute({userID, userSessionID})
    }
}

const authService = AuthService.getInstance()

export default authService;