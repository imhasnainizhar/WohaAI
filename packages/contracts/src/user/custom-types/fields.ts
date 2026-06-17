import z from "zod";
import {
    FullNameSchema,
    UsernameSchema,
    EmailSchema,
    DateOfBirthSchema,
    PasswordSchema,
    VerificationCodeSchema,
    SessionIDSchema,
    UsernameOrEmailSchema
} from "../schemas/fields";

export type FullName = z.infer<typeof FullNameSchema>;
export type Username = z.infer<typeof UsernameSchema>;
export type Email = z.infer<typeof EmailSchema>;
export type DateOfBirth = z.infer<typeof DateOfBirthSchema>;
export type Password = z.infer<typeof PasswordSchema>;
export type UsernameOrEmail = z.infer<typeof UsernameOrEmailSchema>;

export type VerificationCode = z.infer<typeof VerificationCodeSchema>;
export type SessionID = z.infer<typeof SessionIDSchema>

export interface ClientData {
    userDeviceName: string;
    userDeviceType: string;
    userDeviceBrowser: string;
    userDeviceOS: string;
    userIPAddress: string;
}

export interface UserSession {
    id: string;
    userSessionID: string;
    userDeviceName: string;
    userDeviceType: string;
    userDeviceBrowser: string;
    userDeviceOS: string;
    userIPAddress: string;
}