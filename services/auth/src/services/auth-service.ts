import { AuthRepo } from "@/repo/auth-repo";
import { userPrisma } from "@packages/prisma-users";
import { UserProvisioningClient } from "@/clients/user-provision";
import { env } from "@/config/env";

import {
    SigninServiceParams,
    SigninService,
    SigninServiceResponse
} from "./signin";

import {
    SignoutServiceParams,
    SignoutService,
    SignoutServiceResponse
} from "./signout";

import {
    RefreshSessionServiceParams,
    RefreshSessionService,
    RefreshSessionServiceResponse
} from "./refresh-session";

import {
    SignupInitServiceParams,
    SignupInitService,
    SignupInitServiceResponse
} from "./signup/init";

import {
    ContinueWithEmailService,
    ContinueWithEmailServiceParams,
    ContinueWithEmailServiceResponse
} from "./signup/continue/email";

import {
    ContinueWithUsernameService,
    ContinueWithUsernameServiceParams,
    ContinueWithUsernameServiceResponse
} from './signup/continue/username';

import {
    NameValidationService,
    NameValidationServiceParams,
    NameValidationServiceResponse
} from "./signup/validations/name";

import {
    PasswordValidationService,
    PasswordValidationServiceParams,
    PasswordValidationServiceResponse
} from "./signup/validations/password";

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
    ChangeForgottenPasswordServiceParams,
    ChangeForgottenPasswordServiceResponse,
    ForgotPasswordInitServiceParams,
    ForgotPasswordInitServiceResponse,
    ForgotPasswordService,
    VerifyForgotPasswordServiceParams,
    VerifyForgotPasswordServiceResponse
} from "./forgot-password";

import {
    ChangePasswordService,
    ChangePasswordServiceParams,
    ChangePasswordServiceResponse
} from "./change-password";

import {
    Disable2FAService,
    Disable2FAServiceParams,
    Disable2FAServiceResponse
} from "./two-fa/disable";

import {
    Enable2FAService,
    Enable2FAServiceParams,
    Enable2FAServiceResponse
} from "./two-fa/enable";

import {
    Generate2FASecretService,
    Generate2FASecretServiceParams,
    Generate2FASecretServiceResponse
} from "./two-fa/generate";

import {
    Verify2FAService,
    Verify2FAServiceParams,
    Verify2FAServiceResponse
} from "./two-fa/verify";

import { SendVerificationEmailResponse } from "@packages/contracts/auth";

class AuthService {
    private static instance: AuthService;

    private constructor(
        private readonly signinService: SigninService,
        private readonly signoutService: SignoutService,
        private readonly refreshSessionService: RefreshSessionService,

        private readonly signupInitService: SignupInitService,
        private readonly continueWithUsernameService: ContinueWithUsernameService,
        private readonly continueWithEmailService: ContinueWithEmailService,

        private readonly sendVerificationEmailService: SendVerificationEmailService,
        private readonly verifyUserEmailService: VerifyUserEmailService,

        private readonly nameValidationService: NameValidationService,
        private readonly passwordValidationService: PasswordValidationService,

        private readonly signupCompleteService: SignupCompleteService,

        private readonly forgotPasswordService: ForgotPasswordService,

        private readonly changePasswordService: ChangePasswordService,

        private readonly generate2FASecretService: Generate2FASecretService,
        private readonly verify2FAService: Verify2FAService,
        private readonly enable2FAService: Enable2FAService,
        private readonly disable2FAService: Disable2FAService
    ) { }

    /**
     * Singleton accessor
     */
    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            const authRepo = new AuthRepo(userPrisma);

            // Currently using nextjs var, but URI is same for the service
            const userProvisioningClient = new UserProvisioningClient(env.NEXT_PUBLIC_USER_API_URI);

            const signinService = new SigninService(authRepo);
            const signoutService = new SignoutService(authRepo);
            const refreshSessionService = new RefreshSessionService(authRepo);

            const signupInitService = new SignupInitService(authRepo);
            const continueWithUsernameService = new ContinueWithUsernameService(authRepo);
            const continueWithEmailService = new ContinueWithEmailService(authRepo);

            const sendVerificationEmailService = new SendVerificationEmailService();
            const verifyUserEmailService = new VerifyUserEmailService();

            const nameValidationService = new NameValidationService();
            const passwordValidationService = new PasswordValidationService();

            const signupCompleteService = new SignupCompleteService(authRepo, userProvisioningClient);

            const forgotPasswordService = new ForgotPasswordService(authRepo);

            const changePasswordService = new ChangePasswordService(authRepo);

            const generate2FASecretService = new Generate2FASecretService(authRepo);
            const verify2FAService = new Verify2FAService(authRepo);
            const enable2FAService = new Enable2FAService(authRepo);
            const disable2FAService = new Disable2FAService(authRepo);

            AuthService.instance = new AuthService(
                signinService,
                signoutService,
                refreshSessionService,

                signupInitService,
                continueWithUsernameService,
                continueWithEmailService,

                sendVerificationEmailService,
                verifyUserEmailService,

                nameValidationService,
                passwordValidationService,

                signupCompleteService,

                forgotPasswordService,

                changePasswordService,

                generate2FASecretService,
                verify2FAService,
                enable2FAService,
                disable2FAService
            );
        }

        return AuthService.instance;
    }

    public async signin({
        usernameOrEmail,
        password,
        clientData,
        rememberMe
    }: SigninServiceParams): Promise<SigninServiceResponse> {
        return this.signinService.execute({
            usernameOrEmail,
            password,
            clientData,
            rememberMe
        });
    }

    public async signout({
        userID,
        userSessionID
    }: SignoutServiceParams): Promise<SignoutServiceResponse> {
        return this.signoutService.execute({ userID, userSessionID })
    }

    public async refreshSession({
        refreshToken,
        userIPAddress
    }: RefreshSessionServiceParams): Promise<RefreshSessionServiceResponse> {
        return this.refreshSessionService.execute({ refreshToken, userIPAddress })
    }

    public async signupInit({
        usernameOrEmail
    }: SignupInitServiceParams): Promise<SignupInitServiceResponse> {
        return this.signupInitService.execute({ usernameOrEmail })
    }

    public async continueWithUsername({
        signupSessionID,
        username
    }: ContinueWithUsernameServiceParams): Promise<ContinueWithUsernameServiceResponse> {
        return this.continueWithUsernameService.execute({ signupSessionID, username })
    }

    public async continueWithEmail({
        signupSessionID,
        email
    }: ContinueWithEmailServiceParams): Promise<ContinueWithEmailServiceResponse> {
        return this.continueWithEmailService.execute({ signupSessionID, email })
    }

    public async sendVerificationEmail({
        signupSessionID
    }: SendVerificationServiceParams): Promise<SendVerificationEmailResponse> {
        return this.sendVerificationEmailService.execute({ signupSessionID })
    }

    public async verifyUserEmail({
        signupSessionID,
        verificationCode
    }: VerifyUserEmailServiceParams): Promise<VerifyUserEmailServiceResponse> {
        return this.verifyUserEmailService.execute({ signupSessionID, verificationCode })
    }

    public async validateName({
        signupSessionID,
        firstName,
        lastName
    }: NameValidationServiceParams): Promise<NameValidationServiceResponse> {
        return this.nameValidationService.execute({ signupSessionID, firstName, lastName })
    }

    public async validatePassword({
        signupSessionID,
        zodValidatedPassword
    }: PasswordValidationServiceParams): Promise<PasswordValidationServiceResponse> {
        return this.passwordValidationService.execute({ signupSessionID, zodValidatedPassword })
    }

    public async completeSignup({
        signupSessionID,
        rememberMe,
        clientData
    }: SignupCompleteServiceParams): Promise<SignupCompleteServiceResponse> {
        return this.signupCompleteService.execute({ signupSessionID, rememberMe, clientData })
    }

    public async forgotPasswordInit({
        parsed
    }: ForgotPasswordInitServiceParams): Promise<ForgotPasswordInitServiceResponse> {
        return this.forgotPasswordService.init({ parsed })
    }

    public async verifyForgetPasswordRequest({
        sessionID
    }: VerifyForgotPasswordServiceParams): Promise<VerifyForgotPasswordServiceResponse> {
        return this.forgotPasswordService.verify({ sessionID })
    }

    public async changeForgottenPassword({
        sessionID,
        password
    }: ChangeForgottenPasswordServiceParams): Promise<ChangeForgottenPasswordServiceResponse> {
        return this.forgotPasswordService.changePassword({ sessionID, password })
    }

    public async changePassword({
        userID,
        oldPassword,
        newPassword
    }: ChangePasswordServiceParams): Promise<ChangePasswordServiceResponse> {
        return this.changePasswordService.execute({ userID, oldPassword, newPassword })
    }

    public async generate2FASecret({
        userID
    }: Generate2FASecretServiceParams): Promise<Generate2FASecretServiceResponse> {
        return this.generate2FASecretService.execute({ userID })
    }

    public async verify2FA({
        userID,
        token
    }: Verify2FAServiceParams): Promise<Verify2FAServiceResponse> {
        return this.verify2FAService.execute({
            userID,
            token
        })
    }

    public async enable2FA({
        userID,
        token
    }: Enable2FAServiceParams): Promise<Enable2FAServiceResponse> {
        return this.enable2FAService.execute({
            userID,
            token
        })
    }

    public async disable2FA({
        userID,
        token
    }: Disable2FAServiceParams): Promise<Disable2FAServiceResponse> {
        return this.disable2FAService.execute({
            userID,
            token
        })
    }
}

const authService = AuthService.getInstance()

export default authService;