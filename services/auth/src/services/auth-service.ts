import { AuthRepo } from "@/repo/auth-repo";
import { prisma } from "@packages/prisma";
import { SigninParams, SigninService } from "./signin";
import { SignoutParams, SignoutService } from "./signout";
import { RefreshSessionParams, RefreshSessionService } from "./refresh-session";

import { SignupInitParams, SignupInitService } from "./signup/init";
import { redisHelpers } from "@packages/redis";
import { ContinueWithEmailService } from "./signup/continue/email";
import { ContinueWithUsernameService } from './signup/continue/username';
import { NameValidationService } from "./signup/validations/name";
import { PasswordValidationService } from "./signup/validations/password";
import { SignupCompleteService } from "./signup/complete";
import { UserProvisioningClient } from "@/clients/user-provision";
import { env } from "@/config/env";

class AuthService {
    private static instance: AuthService;

    private constructor(
        private readonly signinService: SigninService,
        private readonly refreshSessionService: RefreshSessionService,
        private readonly signupInitService: SignupInitService,
        private readonly signoutService: SignoutService,
        private readonly continueWithUsernameService: ContinueWithUsernameService,
        private readonly continueWithEmailService: ContinueWithEmailService,
        private readonly nameValidationService: NameValidationService,
        private readonly passwordValidationService: PasswordValidationService,
        private readonly signupCompleteService: SignupCompleteService,
    ) { }

    /**
     * Singleton accessor
     */
    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            const authRepo = new AuthRepo(prisma);

            // Currently using nextjs var, but URI is same for the service
            const userProvisioningClient = new UserProvisioningClient(env.NEXT_PUBLIC_USER_API_URI);

            const signinService = new SigninService(
                authRepo
            );

            const refreshSessionService =
                new RefreshSessionService(authRepo);

            const continueWithUsernameService =
                new ContinueWithUsernameService(authRepo);

            const continueWithEmailService =
                new ContinueWithEmailService(authRepo);

            const signoutService =
                new SignoutService(authRepo);

            const signupInitService =
                new SignupInitService(authRepo, redisHelpers);

            const nameValidationService =
                new NameValidationService();
            
            const passwordValidationService =
                new PasswordValidationService();

            const signupCompleteService =
                new SignupCompleteService(userProvisioningClient)

            AuthService.instance = new AuthService(
                signinService,
                refreshSessionService,
                signupInitService,
                signoutService,
                continueWithUsernameService,
                continueWithEmailService,
                nameValidationService,
                passwordValidationService,
                signupCompleteService,
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

    public async continueWithUsername({
        signupSessionID,
        username
    }: { 
        signupSessionID: string
        username: string 
    }) {
        return this.continueWithUsernameService.execute({signupSessionID, username})
    }

    public async continueWithEmail({
        signupSessionID,
        email
    }: { 
        signupSessionID: string
        email: string 
    }) {
        return this.continueWithEmailService.execute({signupSessionID, email})
    }

    public async validateName({
        signupSessionID,
        firstName,
        lastName
    }: { 
        signupSessionID: string
        firstName: string 
        lastName: string
    }) {
        return this.nameValidationService.execute({signupSessionID, firstName, lastName})
    }

    public async validatePassword({
        signupSessionID,
        zodValidatedPassword
    }: { 
        signupSessionID: string
        zodValidatedPassword: string 
    }) {
        return this.passwordValidationService.execute({ signupSessionID, password: zodValidatedPassword })
    }

    public async completeSignup({
        signupSessionID,
    }: { 
        signupSessionID: string
        zodValidatedPassword: string 
    }) {
        return this.signupCompleteService.execute({ signupSessionID })
    }
}

const authService = AuthService.getInstance()

export default authService;