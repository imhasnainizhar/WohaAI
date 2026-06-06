"use client";

import { useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ClassicButton from "@/components/ui/buttons/ClassicButton";
import { RoundedInputField } from "@/components/ui/input/fields/RoundedInputField";
import { useEffect } from "react";
import { ContinueWithEmailRequestSchema, ContinueWithEmailRequest } from "@packages/contracts/auth";

export default function SignupEmail({
    next,
    data,
}: {
    next: (next: any) => void;
    data?: ContinueWithEmailRequest;
}) {
    const [personalInputError, setPersonalInputError] = useState<string>("")
    const [cacheBeingUsed, setCacheBeingUsed] = useState(false);
    const { theme } = useTheme();
    const darkTheme = theme === "dark";

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isSubmitting },
    } = useForm<ContinueWithEmailRequest>({
        resolver: zodResolver(ContinueWithEmailRequestSchema),
    });

    useEffect(() => {
        if (data?.email) {
            reset({ email: data.email }); // populate with cached data
            setCacheBeingUsed(true);
        }
    }, [data, reset]);

    return (
        <form className="w-full flex flex-col items-center justify-center gap-8"
            method="POST"
            onSubmit={handleSubmit(next)}
        >
            <div className="w-[85%]">
                <RoundedInputField
                    label="Email"
                    name="email"
                    register={register}
                    error={errors.email}
                    theme={darkTheme ? "dark" : "light"}
                    cacheBeingUsed={cacheBeingUsed}
                />
            </div>
            <ClassicButton text="Continue" />
        </form>
    );
}