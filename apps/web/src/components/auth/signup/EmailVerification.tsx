"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { VerifyUserEmailRequestSchema } from "@wohaai/validations";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup, Field, FieldDescription } from "@/components/ui/field";
import { FloatingInput } from "@/components/input/fields/FloatingInput";
import { env } from "@wohaai/env-ts";

type EmailVerificationInput = z.input<typeof VerifyUserEmailRequestSchema>;
type EmailVerificationOutput = z.output<typeof VerifyUserEmailRequestSchema>;

interface EmailVerificationProps {
    next: (values: any) => void;
    setNextStep: (step: "username" | "email" | "email_verification" | "password" | "complete_signup") => void;
    data?: any;
}

export default function EmailVerification({
    next,
    setNextStep,
    data,
}: EmailVerificationProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EmailVerificationInput, any, EmailVerificationOutput>({
        resolver: zodResolver(VerifyUserEmailRequestSchema),
    });

    const [error, setError] = useState<string>("");

    const onSubmit = async (formData: EmailVerificationOutput) => {
        setError("");
        const { verificationCode } = formData;

        try {
            const authURI = env.NEXT_PUBLIC_AUTH_API_URI;
            const rawRes = await fetch(`${authURI}/api/auth/signup/verify-email`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ verificationCode }),
            });

            const res = await rawRes.json();

            if (!res.ok) {
                setError(res.message || "Failed to verify email.");
                return;
            }

            if (res.success) {
                setNextStep("password");
                next({ verificationCode });
            } else {
                setError("Invalid verification code.");
            }
        } catch (err) {
            console.error("Email verification error:", err);
            setError("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div className="w-full flex flex-col gap-6">
            <Card className={`rounded-[35px] border-none! shadow-none!`}>
                <CardContent className={``}>
                    <FieldGroup className={`gap-4!`}>
                        <form onSubmit={handleSubmit(onSubmit)} method="post">
                            <div className={`flex flex-col gap-4`}>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <Field>
                                    <FloatingInput
                                        id="verificationCode"
                                        label="Verification Code"
                                        error={errors.verificationCode}
                                        {...register("verificationCode")}
                                    />
                                </Field>
                                <Field>
                                    <Button type="submit" className={`bg-primary text-primary-foreground! text-fluid-base font-semibold hover:bg-primary/70! transition-all ease-in-out duration-300 cursor-pointer`}>Verify</Button>
                                </Field>
                            </div>
                        </form>
                    </FieldGroup>
                </CardContent>
            </Card>
            <FieldDescription className="px-4 text-center text-[10px]! text-muted-foreground">
                Enter the 6-digit code sent to your email
            </FieldDescription>
        </div>
    );
}
