"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ContinueWithEmailRequestSchema } from "@wohaai/validations";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup, Field, FieldDescription } from "@/components/ui/field";
import { FloatingInput } from "@/components/input/fields/FloatingInput";
import { env } from "@wohaai/env-ts";
import { ApiResponseOptions } from "@wohaai/http";

type SignupEmailInput = z.input<typeof ContinueWithEmailRequestSchema>;
type SignupEmailOutput = z.output<typeof ContinueWithEmailRequestSchema>;

interface SignupEmailProps {
    next: (values: any) => void;
    setNextStep: (step: "username" | "email" | "email_verification" | "password" | "complete_signup") => void;
    data?: any;
}

export default function SignupEmail({
    next,
    setNextStep,
    data,
}: SignupEmailProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupEmailInput, any, SignupEmailOutput>({
        resolver: zodResolver(ContinueWithEmailRequestSchema),
        defaultValues: {
            email: data?.email,
        },
    });

    const [error, setError] = useState<string>("");

    const onSubmit = async (formData: SignupEmailOutput) => {
        setError("");
        const { email } = formData;

        try {
            const authURI = env.NEXT_PUBLIC_AUTH_API_URI;
            const rawRes = await fetch(`${authURI}/api/auth/signup/continue-with-email`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const res = await rawRes.json();
            const body: ApiResponseOptions = res.body;

            if (!res.ok) {
                setError(body.message || "Failed to validate email.");
                return;
            }

            if (body.success) {
                setNextStep("email_verification");
                next({ email });
            } else {
                setError("Email is already registered.");
            }
        } catch (err) {
            console.error("Email validation error:", err);
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
                                        id="email"
                                        label="Email"
                                        error={errors.email}
                                        {...register("email")}
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