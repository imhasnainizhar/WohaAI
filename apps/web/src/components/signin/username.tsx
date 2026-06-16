"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ContinueWithEmailRequestSchema } from "@packages/contracts/auth";
import z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { FieldGroup, Field, FieldDescription } from "../ui/field";
import { FloatingInput } from "../input/fields/FloatingInput";

type SigninEmailInput = z.input<typeof ContinueWithEmailRequestSchema>;
type SigninEmailOutput = z.output<typeof ContinueWithEmailRequestSchema>;

interface SigninEmailProps {
    next: (values: any) => void;
    setNextStep: (step: "email" | "username" | "password" | null) => void;
    data?: { username?: string };
}

export default function SigninEmail({
    next,
    setNextStep,
    data,
}: SigninEmailProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SigninEmailInput, any, SigninEmailOutput>({
        resolver: zodResolver(ContinueWithEmailRequestSchema),
    });

    const [error, setError] = useState<string>("");

    const onSubmit = async (formData: SigninEmailOutput) => {
        setError("");

        try {
            const res = await fetch("/api/auth/continue-with-email", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    username: data?.username,
                }),
            });

            const responseData = await res.json();

            if (!res.ok) {
                setError(responseData.message || "Failed to validate email.");
                return;
            }

            // Email validated, go to password
            setNextStep("password");
            next({ email: formData.email, username: data?.username });
        } catch (err) {
            console.error("Email validation error:", err);
            setError("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div className="w-full flex flex-col gap-6">
            <Card className={`rounded-[35px] py-8 px-2 border-none! shadow-none!`}>
                <CardContent className={`px-3.5 md:px-6`}>
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
                By continuing, you acknowledge WohaAI’s Terms of Service and Privacy Policy
            </FieldDescription>
        </div>
    );
}