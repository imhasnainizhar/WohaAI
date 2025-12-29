"use client";

import { useState } from "react";
import { DatePicker } from "@components/ui/date-picker"
import { RoundedInputField } from "@components/ui/input/fields/rounded";
import { useTheme } from "@providers/theme";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupPersonalInfoSchema, SignupPersonalInfoInput } from "@lib/schemas/signup";
import ClassicButton from "@components/ui/buttons/classic-button";

export default function SignupPersonalInfo({
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
    } = useForm<SignupPersonalInfoInput>({
        resolver: zodResolver(SignupPersonalInfoSchema),
    });

    const SIGNUP_API_URI = process.env.NEXT_PUBLIC_SIGNUP_API_URI!;

    const onSignupPersonalInput = async (signupPersonalInput: SignupPersonalInfoInput) => {
        setPersonalInputError("");

        try {
            const res = await fetch(SIGNUP_API_URI, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...signupPersonalInput,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setPersonalInputError(data.message || "Failed to sign in.");
                return;
            }
        } catch (error) {
            console.error("SignIn Error:", error);
            setPersonalInputError("An unexpected error occurred. Please try again.");
        }
    };


    return (
        <form className="w-full flex flex-col items-center justify-center gap-8"
            method="POST"
            onSubmit={handleSubmit(next)}
        >
            <div className="w-[85%]">
                <RoundedInputField
                    label="First Name"
                    name="firstName"
                    register={register}
                    error={errors.firstName}
                    theme={darkTheme ? "dark" : "light"}
                />
            </div>
            <div className="w-[85%]">
                <RoundedInputField
                    label="Last Name"
                    name="lastName"
                    register={register}
                    error={errors.lastName}
                    theme={darkTheme ? "dark" : "light"}
                />
            </div>
            <div className="w-[85%]">
                <DatePicker
                    name="date"
                    register={register}
                    control={control}
                    placeholder="Date of Birth"
                    theme={darkTheme ? "dark" : "light"}
                />
            </div>
            <ClassicButton text="Continue" />
        </form>
    );
}