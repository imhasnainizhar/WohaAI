import { AuthRepo } from "@/repo/AuthRepo";
import { prisma } from "@packages/prisma";
import { SigninService } from "./signin";
import { SignoutService } from "./signout";
import { RefreshTokenService } from "./refresh-token";

import { SigninParams, SignoutParams } from "@/types/service/params";

class AuthService {
    private static instance: AuthService;

    private constructor(
        private readonly signinService: SigninService,
        private readonly refreshTokenService: RefreshTokenService,
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

            const refreshTokenService =
                new RefreshTokenService(authRepo);

            const signoutService =
                new SignoutService(authRepo);

            AuthService.instance = new AuthService(
                signinService,
                refreshTokenService,
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