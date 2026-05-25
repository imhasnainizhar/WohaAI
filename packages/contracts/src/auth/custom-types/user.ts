import z from "zod";
import {
    FirstNameSchema,
    LastNameSchema,
    UsernameSchema,
    EmailSchema,
    DateOfBirthSchema,
    PasswordSchema,
    ConfirmPasswordSchema
} from "../schema/user";

export type FirstName = z.infer<typeof FirstNameSchema>;
export type LastName = z.infer<typeof LastNameSchema>;
export type Username = z.infer<typeof UsernameSchema>;
export type Email = z.infer<typeof EmailSchema>;
export type DateOfBirth = z.infer<typeof DateOfBirthSchema>;
export type Password = z.infer<typeof PasswordSchema>;
export type ConfirmPassword = z.infer<typeof ConfirmPasswordSchema>;

export interface ClientData {
    userDeviceName: string;
    userDeviceType: string;
    userDeviceBrowser: string;
    userDeviceOS: string;
    userIPAddress: string;
}

export interface UserSession {
    userID: string;
    userSessionID: string;
    userDeviceName: string;
    userDeviceType: string;
    userDeviceBrowser: string;
    userDeviceOS: string;
    userIPAddress: string;
}