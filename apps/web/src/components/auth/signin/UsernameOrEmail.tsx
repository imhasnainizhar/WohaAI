"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { UsernameOrEmailSchema } from "@wohaai/validations";
import z from "zod";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { FieldGroup, Field, FieldSeparator, FieldDescription } from "../../ui/field";
import Link from "next/link";
import { FloatingInput } from "../../input/fields/FloatingInput";
import Image from "next/image";
import { FaApple } from "react-icons/fa";
import { env } from "@wohaai/env-ts";;
import { ApiResponseOptions } from '@wohaai/http';

const SigninInitRequestSchema = z.object({
    usernameOrEmail: UsernameOrEmailSchema,
});

type SigninInitInput = z.input<typeof SigninInitRequestSchema>;
type SigninInitOutput = z.output<typeof SigninInitRequestSchema>;

interface SigninUsernameOrEmailProps {
    next: (values: any) => void;
    setNextStep: (step: "usernameOrEmail" | "password") => void;
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

        // Check if the user exists
        try {
            const authURI = env.NEXT_PUBLIC_AUTH_API_URI;
            const rawRes = await fetch(`${authURI}/api/auth/signin-init`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ usernameOrEmail }),
            });

            const res = await rawRes.json();
            const body: ApiResponseOptions = res.body;

            if (!res.ok) {
                setError(body.message || "Failed to check user.");
                return;
            }

            if (body.success) {
                // User exists, go to password
                setNextStep("password");
                next({ usernameOrEmail });
            } else {
                setError("Username or Email doesn't exist.");
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