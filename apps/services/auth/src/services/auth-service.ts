import { AuthRepo } from "@/repo/auth-repo";
import { UserProvisioningClient } from "@wohaai/lib";
import { authLogger } from "@wohaai/telemetry";

import {
    SigninService,
    CompleteSigninServiceParams,
    CompleteSigninServiceResponse,
    SigninInitServiceParams,
    SigninInitServiceResponse
} from "./signin";

import {
    SignoutServiceParams,
    SignoutService,
} from "./signout";

import {
    RefreshSessionServiceParams,
    RefreshSessionService,
    RefreshSessionServiceResponse
} from "./refresh-session";

import {
    SignupInitService,
    SignupInitServiceResponse,
} from "./signup/init";

import {
    SignupEmailValidationService,
    SignupEmailValidationServiceParams,
} from "./signup/email";

import {
    SignupUsernameValidationService,
    SignupUsernameValidationServiceParams,
} from './signup/username';

import {
    PasswordValidationService,
    PasswordValidationServiceParams,
} from "./signup/password";

import {
    SignupCompleteService,
    SignupCompleteServiceParams,
    SignupCompleteServiceResponse
} from "./signup/complete";

import {
    SendVerificationEmailService,
    SendVerificationServiceParams

} from "./signup/verification/send-verification-email";

import {
    VerifyUserEmailService,
    VerifyUserEmailServiceParams,
    VerifyUserEmailServiceResponse
} from "./signup/verification/verify-user-email";

import {
    ChangePasswordInitServiceParams,
    VerifyChangePasswordServiceParams,
    VerifyChangePasswordServiceResponse,
    ChangePasswordService,
    CompleteChangePasswordServiceResponse,
} from "./change-password";

import {
    Disable2FAService,
    Disable2FAServiceParams,
} from "./two-fa/disable";

import {
    Enable2FAService,
    Enable2FAServiceParams,
} from "./two-fa/enable";

import {
    Generate2FASecretService,
    Generate2FASecretServiceParams,
    Generate2FASecretServiceResponse
} from "./two-fa/generate";

import {
    Verify2FAService,
    Verify2FAServiceParams,
} from "./two-fa/verify";

import { RequestEmailChangeService, RequestEmailChangeServiceParams } from "./change-email/request";
import { VerifyEmailChangeService, VerifyEmailChangeServiceParams } from "./change-email/verify";
import { env } from "@wohaai/env-ts";
import { Router } from 'express';
import { UserGrpcClient } from "@/grpc/grpc";

export class AuthService {
    private static instance: AuthService;

    // Making constructor public for testing. (For mocking)
    constructor(
        private readonly signinService: SigninService,
        private readonly signoutService: SignoutService,
        private readonly refreshSessionService: RefreshSessionService,

        private readonly signupInitService: SignupInitService,
        private readonly signupUsernameValidationService: SignupUsernameValidationService,
        private readonly signupEmailValidationService: SignupEmailValidationService,

        private readonly sendVerificationEmailService: SendVerificationEmailService,
        private readonly verifyUserEmailService: VerifyUserEmailService,

        private readonly passwordValidationService: PasswordValidationService,

        private readonly signupCompleteService: SignupCompleteService,

        private readonly changePasswordService: ChangePasswordService,

        private readonly generate2FASecretService: Generate2FASecretService,
        private readonly verify2FAService: Verify2FAService,
        private readonly enable2FAService: Enable2FAService,
        private readonly disable2FAService: Disable2FAService,

        private readonly requestEmailChangeService: RequestEmailChangeService,
        private readonly verifyEmailChangeService: VerifyEmailChangeService
    ) { }

    /**
     * Singleton accessor
     */
    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            const authRepo = new AuthRepo();

            // Currently using nextjs var, but URI is same for the service
            const userProvisioningClient = new UserProvisioningClient(env.NEXT_PUBLIC_USER_API_URI);

            const signinService = new SigninService(authRepo);
            const signoutService = new SignoutService(authRepo);
            const refreshSessionService = new RefreshSessionService(authRepo);

            const signupInitService = new SignupInitService();
            const sendVerificationEmailService = new SendVerificationEmailService();
            const verifyUserEmailService = new VerifyUserEmailService();

            const signupUsernameValidationService = new SignupUsernameValidationService(authRepo);
            const signupEmailValidationService = new SignupEmailValidationService(authRepo);

            const passwordValidationService = new PasswordValidationService();

            let userGrpcClient: UserGrpcClient | undefined;
            try {
                userGrpcClient = new UserGrpcClient();
            } catch (error) {
                authLogger.warn('⚠️ Failed to initialize UserGrpcClient, will use REST fallback' + error);
            }

            const signupCompleteService = new SignupCompleteService(authRepo, userProvisioningClient, userGrpcClient);

            const changePasswordService = new ChangePasswordService(authRepo);

            const generate2FASecretService = new Generate2FASecretService(authRepo);
            const verify2FAService = new Verify2FAService(authRepo);
            const enable2FAService = new Enable2FAService(authRepo);
            const disable2FAService = new Disable2FAService(authRepo);

            const requestEmailChangeService = new RequestEmailChangeService(authRepo);
            const verifyEmailChangeService = new VerifyEmailChangeService(authRepo);

            AuthService.instance = new AuthService(
                signinService,
                signoutService,
                refreshSessionService,

                signupInitService,
                signupUsernameValidationService,
                signupEmailValidationService,

                sendVerificationEmailService,
                verifyUserEmailService,

                passwordValidationService,

                signupCompleteService,

                changePasswordService,

                generate2FASecretService,
                verify2FAService,
                enable2FAService,
                disable2FAService,

                requestEmailChangeService,
                verifyEmailChangeService
            );
        }

        return AuthService.instance;
    }

    public async signinInit({
        usernameOrEmail,
    }: SigninInitServiceParams): Promise<SigninInitServiceResponse> {
        authLogger.debug({ usernameOrEmail }, "Signin init requested");
        return this.signinService.init({
            usernameOrEmail,
        });
    }

    public async signinComplete({
        usernameOrEmail,
        password,
        clientData
    }: CompleteSigninServiceParams): Promise<CompleteSigninServiceResponse> {
        authLogger.debug({ usernameOrEmail, clientData }, "Signin complete requested");
        return this.signinService.complete({
            usernameOrEmail,
            password,
            clientData
        });
    }

    public async signout({
        userID,
        userSessionID
    }: SignoutServiceParams) {
        authLogger.debug({ userID, userSessionID }, "Signout requested");
        return this.signoutService.execute({ userID, userSessionID })
    }

    public async refreshSession({
        refreshToken,
        userIPAddress
    }: RefreshSessionServiceParams): Promise<RefreshSessionServiceResponse> {
        authLogger.debug({ userIPAddress }, "Session refresh requested");
        return this.refreshSessionService.execute({ refreshToken, userIPAddress })
    }

    public async signupInit(): Promise<SignupInitServiceResponse> {
        authLogger.debug("Signup init requested");
        return this.signupInitService.execute()
    }

    public async signupUsernameValidation({
        authSessionID,
        username
    }: SignupUsernameValidationServiceParams) {
        authLogger.debug({ authSessionID, username }, "Username validation requested");
        return this.signupUsernameValidationService.execute({ authSessionID, username })
    }

    public async signupEmailValidation({
        authSessionID,
        email
    }: SignupEmailValidationServiceParams) {
        authLogger.debug({ authSessionID, email }, "Email validation requested");
        return this.signupEmailValidationService.execute({ authSessionID, email })
    }

    public async sendVerificationEmail({
        authSessionID
    }: SendVerificationServiceParams) {
        authLogger.debug({ authSessionID }, "Verification email send requested");
        return this.sendVerificationEmailService.execute({ authSessionID })
    }

    public async verifyUserEmail({
        authSessionID,
        verificationCode
    }: VerifyUserEmailServiceParams): Promise<VerifyUserEmailServiceResponse> {
        authLogger.debug({ authSessionID }, "Email verification requested");
        return this.verifyUserEmailService.execute({ authSessionID, verificationCode })
    }

    public async validatePassword({
        authSessionID,
        zodValidatedPassword
    }: PasswordValidationServiceParams) {
        authLogger.debug({ authSessionID }, "Password validation requested");
        return this.passwordValidationService.execute({ authSessionID, zodValidatedPassword })
    }

    public async completeSignup({
        authSessionID,
        authToken,
        clientData
    }: SignupCompleteServiceParams): Promise<SignupCompleteServiceResponse> {
        authLogger.debug({ authSessionID, clientData }, "Signup completion requested");
        return this.signupCompleteService.execute({ authSessionID, authToken, clientData })
    }

    public async changePasswordInit({
        usernameOrEmail
    }: ChangePasswordInitServiceParams) {
        authLogger.debug({ usernameOrEmail }, "Password change init requested");
        return this.changePasswordService.init({ usernameOrEmail })
    }

    public async verifyChangePasswordRequest({
        sessionID
    }: VerifyChangePasswordServiceParams): Promise<VerifyChangePasswordServiceResponse> {
        authLogger.debug({ sessionID }, "Password change verification requested");
        return this.changePasswordService.verify({ sessionID })
    }

    public async completeChangePassword({
        sessionID,
        password
    }: CompleteChangePasswordServiceResponse) {
        authLogger.debug({ sessionID }, "Password change completion requested");
        return this.changePasswordService.complete({ sessionID, password })
    }

    public async generate2FASecret({
        userID
    }: Generate2FASecretServiceParams): Promise<Generate2FASecretServiceResponse> {
        authLogger.debug({ userID }, "2FA secret generation requested");
        return this.generate2FASecretService.execute({ userID })
    }

    public async verify2FA({
        userID,
        token
    }: Verify2FAServiceParams): Promise<{ success: boolean }> {
        authLogger.debug({ userID }, "2FA verification requested");
        return this.verify2FAService.execute({
            userID,
            token
        })
    }

    public async enable2FA({
        userID,
        token
    }: Enable2FAServiceParams) {
        authLogger.debug({ userID }, "2FA enable requested");
        return this.enable2FAService.execute({
            userID,
            token
        })
    }

    public async disable2FA({
        userID,
        token
    }: Disable2FAServiceParams) {
        authLogger.debug({ userID }, "2FA disable requested");
        return this.disable2FAService.execute({
            userID,
            token
        })
    }

    public async requestEmailChange({
        userID,
        newEmail
    }: RequestEmailChangeServiceParams) {
        authLogger.debug({ userID, newEmail }, "Email change request initiated");
        return this.requestEmailChangeService.execute({
            userID,
            newEmail
        })
    }

    public async verifyEmailChange({
        sessionID
    }: VerifyEmailChangeServiceParams) {
        authLogger.debug({ sessionID }, "Email change verification requested");
        return this.verifyEmailChangeService.execute({
            sessionID
        })
    }
}

const authService = AuthService.getInstance()

export default authService;