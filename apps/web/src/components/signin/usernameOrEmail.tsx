"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { UsernameOrEmailSchema } from "@packages/contracts/auth";
import z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { FieldGroup, Field, FieldSeparator, FieldDescription } from "../ui/field";
import Link from "next/link";
import { FloatingInput } from "../input/fields/FloatingInput";
import Image from "next/image";
import { FaApple } from "react-icons/fa";

const SigninInitRequestSchema = z.object({
    usernameOrEmail: UsernameOrEmailSchema,
});

type SigninInitInput = z.input<typeof SigninInitRequestSchema>;
type SigninInitOutput = z.output<typeof SigninInitRequestSchema>;

interface SigninUsernameOrEmailProps {
    next: (values: any) => void;
    setNextStep: (step: "email" | "username" | "password" | null) => void;
    data?: any;
}

export default function SigninUsernameOrEmail({
    next,
    setNextStep,
    data,
}: SigninUsernameOrEmailProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SigninInitInput, any, SigninInitOutput>({
        resolver: zodResolver(SigninInitRequestSchema),
        defaultValues: {
            usernameOrEmail: data?.usernameOrEmail,
        },
    });

    const [error, setError] = useState<string>("");

    const onSubmit = async (formData: SigninInitOutput) => {
        setError("");
        const { usernameOrEmail } = formData;

        // Determine if it's a username or email
        const isEmail = usernameOrEmail.type === "email";
        const value = usernameOrEmail.value;

        // Check if the user exists
        try {
            const checkEndpoint = isEmail
                ? "/api/auth/check-email"
                : "/api/auth/check-username";

            const res = await fetch(checkEndpoint, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ [isEmail ? "email" : "username"]: value }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to check user.");
                return;
            }

            const exists = isEmail ? data.emailExists : data.usernameExists;

            if (exists) {
                // User exists, go to password
                setNextStep("password");
                next({ [isEmail ? "email" : "username"]: value });
            } else {
                // User doesn't exist
                if (isEmail) {
                    // Started with email, go to password (new user flow)
                    setNextStep("password");
                    next({ email: value });
                } else {
                    // Started with username, go to email step
                    setNextStep("email");
                    next({ username: value });
                }
            }
        } catch (err) {
            console.error("Check user error:", err);
            setError("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div className="w-full flex flex-col gap-6">
            <Card className={`rounded-[35px] border-none! shadow-none!`}>
                <CardContent className={``}>
                    <FieldGroup className={`gap-4!`}>
                        <Field>
                            <Button variant="wohaOutline" type="button" className={`border-border!`}>
                                <Image src={"/logos/google-logo-svg.svg"} alt="  " width={20} height={20} />
                                Login with Google
                            </Button>
                            <Button variant="wohaOutline" type="button" className={`border-border!`}>
                                <FaApple className={`h-5 w-5`} />
                                Login with Apple
                            </Button>
                        </Field>
                        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card my-2">
                            Or continue with
                        </FieldSeparator>
                        <form onSubmit={handleSubmit(onSubmit)} method="post">
                            <div className={`flex flex-col gap-4`}>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <Field>
                                    <FloatingInput
                                        id="usernameOrEmail"
                                        label="Username or Email"
                                        error={errors.usernameOrEmail}
                                        {...register("usernameOrEmail")}
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
                By continuing, you acknowledge WohaAI’s <br /><Link href="/terms">Terms of Service</Link>{" "}
                and <Link href="/privacy">Privacy Policy</Link>
            </FieldDescription>
        </div>
    );
}