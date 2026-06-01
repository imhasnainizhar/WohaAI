import { AuthRepo } from "@/repo/auth-repo";
import { userPrisma } from "@packages/prisma-users";
import { SigninServiceParams, SigninService } from "./signin";
import { SignoutServiceParams, SignoutService } from "./signout";
import { RefreshSessionServiceParams, RefreshSessionService } from "./refresh-session";
import { SignupInitServiceParams, SignupInitService } from "./signup/init";
import { ContinueWithEmailService, ContinueWithEmailServiceParams } from "./signup/continue/email";
import { ContinueWithUsernameService, ContinueWithUsernameServiceParams } from './signup/continue/username';
import { NameValidationService, NameValidationServiceParams } from "./signup/validations/name";
import { PasswordValidationService, PasswordValidationServiceParams } from "./signup/validations/password";
import { SignupCompleteService, SignupCompleteServiceParams } from "./signup/complete";
import { UserProvisioningClient } from "@/clients/user-provision";
import { env } from "@/config/env";
import { 
    SendVerificationEmailService, 
    SendVerificationServiceParams 

} from "./signup/verification/send-verification-email";
import { VerifyUserEmailService, VerifyUserEmailServiceParams } from "./signup/verification/verify-user-email";
import { 
    ChangeForgottenPasswordServiceParams, 
    ForgotPasswordInitServiceParams, 
    ForgotPasswordService, 
    VerifyForgotPasswordServiceParams
} from "./forgot-password";

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

        private readonly forgotPasswordService: ForgotPasswordService
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

            AuthService.instance = new AuthService(
                signinService,
                signoutService ,
                refreshSessionService,

                signupInitService,
                continueWithUsernameService,
                continueWithEmailService,

                sendVerificationEmailService,
                verifyUserEmailService,

                nameValidationService,
                passwordValidationService,

                signupCompleteService,

                forgotPasswordService
            );
        }

        return AuthService.instance;
    }

    public async signin({
        usernameOrEmail,
        password,
        clientData,
        rememberMe
    }: SigninServiceParams) {
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
    }: SignoutServiceParams) {
        return this.signoutService.execute({userID, userSessionID})
    }

    public async refreshSession({
        refreshToken,
        userIPAddress    
    }: RefreshSessionServiceParams) {
        return this.refreshSessionService.execute({refreshToken, userIPAddress})
    }

    public async signupInit({
        usernameOrEmail
    }: SignupInitServiceParams) {
        return this.signupInitService.execute({usernameOrEmail})
    }

    public async continueWithUsername({
        signupSessionID,
        username
    }: ContinueWithUsernameServiceParams) {
        return this.continueWithUsernameService.execute({signupSessionID, username})
    }

    public async continueWithEmail({
        signupSessionID,
        email
    }: ContinueWithEmailServiceParams) {
        return this.continueWithEmailService.execute({signupSessionID, email})
    }

    public async sendVerificationEmail({
        signupSessionID
    }: SendVerificationServiceParams) {
        return this.sendVerificationEmailService.execute({signupSessionID})
    }

    public async verifyUserEmail({
        signupSessionID,
        verificationCode
    }: VerifyUserEmailServiceParams) {
        return this.verifyUserEmailService.execute({signupSessionID, verificationCode})
    }

    public async validateName({
        signupSessionID,
        firstName,
        lastName
    }: NameValidationServiceParams) {
        return this.nameValidationService.execute({signupSessionID, firstName, lastName})
    }

    public async validatePassword({
        signupSessionID,
        zodValidatedPassword
    }: PasswordValidationServiceParams) {
        return this.passwordValidationService.execute({ signupSessionID, zodValidatedPassword })
    }

    public async completeSignup({
        signupSessionID,
        rememberMe,
        clientData
    }: SignupCompleteServiceParams) {
        return this.signupCompleteService.execute({ signupSessionID, rememberMe, clientData })
    }

    public async forgotPasswordInit({
        parsed
    }: ForgotPasswordInitServiceParams) {
        return this.forgotPasswordService.init({parsed})
    }

    public async verifyForgetPasswordRequest({
        sessionID
    }: VerifyForgotPasswordServiceParams) {
        return this.forgotPasswordService.verify({sessionID})
    }

    public async changeForgottenPassword({
        sessionID,
        password
    }: ChangeForgottenPasswordServiceParams) {
        return this.forgotPasswordService.changePassword({sessionID, password})
    }
}

const authService = AuthService.getInstance()

export default authService;