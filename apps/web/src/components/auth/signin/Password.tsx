"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordValidationRequestSchema } from "@wohaai/validations";
import z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { FieldGroup, Field, FieldDescription } from "../../ui/field";
import { FloatingInput } from "../../input/fields/FloatingInput";

type SigninPasswordInput = z.input<typeof PasswordValidationRequestSchema>;
type SigninPasswordOutput = z.output<typeof PasswordValidationRequestSchema>;

interface SigninPasswordProps {
    next: (values: any) => void;
}

export default function SigninPassword({
    next
}: SigninPasswordProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SigninPasswordInput, any, SigninPasswordOutput>({
        resolver: zodResolver(PasswordValidationRequestSchema),
    });

    const [error, setError] = useState<string>("");
    const router = useRouter();

    const onSubmit = async (formData: SigninPasswordOutput) => {
        setError("");

        try {
            const res = await fetch("/api/auth/signin", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                }),
            });

            const responseData = await res.json();

            if (!res.ok) {
                setError(responseData.message || "Failed to sign in.");
                return;
            }

            // Sign in successful
            router.push("/");
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (err) {
            console.error("Sign in error:", err);
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
                                    <Button type="submit" className={`bg-primary text-primary-foreground! text-fluid-base font-semibold hover:bg-primary/70! transition-all ease-in-out duration-300 cursor-pointer`}>Sign In</Button>
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