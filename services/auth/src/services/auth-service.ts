import { AuthRepo } from "@/repo/auth-repo";
import { prisma } from "@packages/prisma";
import { SigninService } from "./signin";
import { SignoutService } from "./signout";
import { RefreshSessionService } from "./refresh-session";

import { RefreshSessionParams, SigninParams, SignoutParams, SignupInitParams } from "@/types/service/params";
import { SignupInitService } from "./signup/init";
import { redisHelpers } from "@packages/redis";

class AuthService {
    private static instance: AuthService;

    private constructor(
        private readonly signinService: SigninService,
        private readonly refreshSessionService: RefreshSessionService,
        private readonly signupInitService: SignupInitService,
        private readonly signoutService: SignoutService,
        private readonly authRepo: AuthRepo
    ) { }

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

            const signupInitService =
                new SignupInitService(authRepo, redisHelpers);

            AuthService.instance = new AuthService(
                signinService,
                refreshSessionService,
                signupInitService,
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

    public async refreshSession({
        refreshToken,
        userIPAddress    
    }: RefreshSessionParams) {
        return this.refreshSessionService.execute({refreshToken, userIPAddress})
    }

    public async signupInit({
        usernameOrEmail
    }: SignupInitParams) {
        return this.signupInitService.execute({usernameOrEmail})
    }
}

const authService = AuthService.getInstance()

export default authService;