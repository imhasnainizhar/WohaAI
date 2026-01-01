import { JwtPayload } from 'jsonwebtoken';
import z from 'zod';
import { GetStartedSchema,
    sendVerificationEmailSchema,
    CompleteSignupSchema,
    UsernameSignupSchema,
    EmailSignupSchema,
    verifyUserEmailSchema
} from './schemas';

export interface SignupSessionPayload extends JwtPayload {
    signupSessionID: string;
}

export type GetStartedType = z.infer<typeof GetStartedSchema>;
export type sendVerificationEmail = z.infer<typeof sendVerificationEmailSchema>;
export type CompleteSignupType = z.infer<typeof CompleteSignupSchema>
export type UsernameSignupType = z.infer<typeof UsernameSignupSchema>;
export type EmailSignupType = z.infer<typeof EmailSignupSchema>;
export type verifyUserEmail = z.infer<typeof verifyUserEmailSchema>;
