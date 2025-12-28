"use client";

import { useState } from "react";
import { DatePicker } from "@components/ui/date-picker"
import ClassicButton from "@components/ui/buttons/classic-button";
import { LeftArrowButton } from "@components/ui/buttons/left-arrow";
import { RoundedInputField } from "@components/ui/input/fields/rounded";
import { useTheme } from "@providers/theme";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupPersonalInfoSchema, SignupPersonalInfoInput } from "@lib/schemas/signup";

export default function Signup() {
    const [personalInputError, setPersonalInputError] = useState<string>("")
    const { theme } = useTheme();
    const darkTheme = theme === "dark";

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
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
        <div className="w-full h-full flex items-center justify-center bg-bg-primary">
            <div className="p-6 flex flex-col items-center justify-center rounded-[16px] gap-[30px] w-[450px] h-[400px]">
                <div className="relative w-full flex items-center justify-center">
                    <LeftArrowButton
                        onClick={() => { }}
                        className="absolute left-[40px] cursor-pointer w-[25px] h-[25px] flex items-center justify-center"
                    />
                    <div className="font-sans font-semibold text-[22px] text-center text-text w-auto">Continue Signup</div>
                </div>
                <div className="w-full">
                    <div className="w-full flex items-center justify-center flex-col">
                        <form className="w-full flex flex-col items-center justify-center gap-[14px]"
                            method="POST"
                            onSubmit={handleSubmit(onSignupPersonalInput)}
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
                                {errors.date && <span className="text-red-500 text-xs">{errors.date.message}</span>}
                            </div>
                        </form>
                        <ClassicButton />
                    </div>
                </div>
            </div>
        </div>
    );
}