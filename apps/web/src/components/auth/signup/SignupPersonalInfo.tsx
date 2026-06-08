"use client";

import { useEffect, useState } from "react";
import { DatePicker } from "@/components/ui/DatePicker"
import { RoundedInputField } from "@/components/input/fields/RoundedInputField";
import { useTheme } from "@/providers/ThemeProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PersonalInfoValidationRequest, PersonalInfoValidationRequestSchema } from "@packages/contracts/auth";
import ClassicButton from "@/components/ui/buttons/ClassicButton";


export default function SignupPersonalInfo({
    next,
    data,
}: {
    next: (next: any) => void;
    data?: PersonalInfoValidationRequest;
}) {
    const [personalInputError, setPersonalInputError] = useState<string>("")
    const [cacheBeingUsed, setCacheBeingUsed] = useState(false);
    const { theme } = useTheme();
    const darkTheme = theme === "dark";

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isValid, isSubmitting },
    } = useForm<PersonalInfoValidationRequest>({
        resolver: zodResolver(PersonalInfoValidationRequestSchema),
    });

    const SIGNUP_API_URI = process.env.NEXT_PUBLIC_SIGNUP_API_URI!;

    useEffect(() => {
        if (data?.firstName && data?.lastName && data?.dateOfBirth) {
            reset({ firstName: data.firstName, lastName: data.lastName, dateOfBirth: data.dateOfBirth }); // populate with cached data
            setCacheBeingUsed(true);
        }
    }, [data, reset]);


    const onSignupPersonalInput = async (signupPersonalInput: PersonalInfoValidationRequest) => {
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
                    cacheBeingUsed={cacheBeingUsed}
                />
            </div>
            <div className="w-[85%]">
                <RoundedInputField
                    label="Last Name"
                    name="lastName"
                    register={register}
                    error={errors.lastName}
                    theme={darkTheme ? "dark" : "light"}
                    cacheBeingUsed={cacheBeingUsed}
                />
            </div>
            <div className="w-[85%]">
                <DatePicker
                    name="dateOfBirth"
                    register={register}
                    control={control}
                    label="Date of Birth"
                    theme={darkTheme ? "dark" : "light"}
                    cacheBeingUsed={cacheBeingUsed}
                />
            </div>
            <ClassicButton text="Continue" />
        </form>
    );
}