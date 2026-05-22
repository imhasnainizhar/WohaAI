"use client";

import { useState } from "react";
import { useTheme } from "@providers/theme";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupUsernameSchema, SignupUsernameInput } from "@lib/schemas/signup";
import ClassicButton from "@components/ui/buttons/classic-button";
import { RoundedInputField } from "@components/ui/input/fields/rounded";
import { UsernameData } from "@internals/types/auth"
import { useEffect } from "react";

export default function SignupUsername({
    next,
    data,
}: {
    next: (next: any) => void;
    data?: UsernameData;
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
    } = useForm<SignupUsernameInput>({
        resolver: zodResolver(SignupUsernameSchema),
    });

    // Responsible for populating the form fields with cached data
    // Setting cacheBeingUsed true so that lable sustins its position and 
    // do not collide with input text
    useEffect(() => {
        if (data?.username) {
            reset({ username: data.username }); // populate with cached data
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
                    label="Username"
                    name="username"
                    register={register}
                    error={errors.username}
                    theme={darkTheme ? "dark" : "light"}
                    cacheBeingUsed={cacheBeingUsed}
                />
            </div>
            <ClassicButton text="Continue" />
        </form>
    );
}