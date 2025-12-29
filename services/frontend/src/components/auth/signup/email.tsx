"use client";

import { useState } from "react";
import { useTheme } from "@providers/theme";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupEmailInput, SignupEmailSchema } from "@lib/schemas/signup";
import ClassicButton from "@components/ui/buttons/classic-button";
import { RoundedInputField } from "@components/ui/input/fields/rounded";

export default function SignupEmail({
    next,
}: {
    next: (next: any) => void;
}) {
    const [personalInputError, setPersonalInputError] = useState<string>("")
    const { theme } = useTheme();
    const darkTheme = theme === "dark";

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isValid, isSubmitting },
    } = useForm<SignupEmailInput>({
        resolver: zodResolver(SignupEmailSchema),
    });

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
                />
            </div>
            <ClassicButton text="Continue" />
        </form>
    );
}