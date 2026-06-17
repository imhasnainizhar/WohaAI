"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { PasswordValidationRequestSchema } from "@packages/contracts/auth";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup, Field, FieldDescription } from "@/components/ui/field";
import { FloatingInput } from "@/components/input/fields/FloatingInput";

type SignupPasswordInput = z.input<typeof PasswordValidationRequestSchema>;
type SignupPasswordOutput = z.output<typeof PasswordValidationRequestSchema>;

interface SignupPasswordProps {
    next: (values: any) => void;
    setNextStep: (step: "username" | "email" | "email_verification" | "password" | "complete_signup") => void;
}

export default function SignupPassword({
    next,
    setNextStep,
}: SignupPasswordProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupPasswordInput, any, SignupPasswordOutput>({
        resolver: zodResolver(PasswordValidationRequestSchema),
    });

    const [error, setError] = useState<string>("");

    const onSubmit = async (formData: SignupPasswordOutput) => {
        setError("");
        const { password, confirmPassword } = formData;

        try {
            const res = await fetch("/api/auth/signup/password", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    password,
                    confirmPassword,
                }),
            });

            const responseData = await res.json();

            if (!res.ok) {
                setError(responseData.message || "Failed to set password.");
                return;
            }

            if (responseData.success) {
                setNextStep("complete_signup");
                next({ password, confirmPassword });
            } else {
                setError("Failed to set password.");
            }
        } catch (err) {
            console.error("Password set error:", err);
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
                                        id="password"
                                        label="Password"
                                        type="password"
                                        error={errors.password}
                                        {...register("password")}
                                    />
                                </Field>
                                <Field>
                                    <FloatingInput
                                        id="confirmPassword"
                                        label="Confirm Password"
                                        type="password"
                                        error={errors.confirmPassword}
                                        {...register("confirmPassword")}
                                    />
                                </Field>
                                <Field>
                                    <Button type="submit" className={`bg-primary text-primary-foreground! text-fluid-base font-semibold hover:bg-primary/70! transition-all ease-in-out duration-300 cursor-pointer`}>Continue</Button>
                                </Field>
                            </div>
                        </form>
                    </FieldGroup>
                </CardContent>
            </Card>
            <FieldDescription className="px-4 text-center text-[10px]! text-muted-foreground">
                By continuing, you acknowledge WohaAI's Terms of Service and Privacy Policy
            </FieldDescription>
        </div>
    );
}