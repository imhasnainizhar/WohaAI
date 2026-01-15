"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@providers/theme";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClassicButton from "@components/ui/buttons/classic-button";
import { RoundedInputField } from "@components/ui/input/fields/rounded";
import { GetStartedSchema } from "@packages/shared/auth";
import { GetStartedType } from "@packages/shared/auth";
import { useAppContext } from "@providers/app";
import { GetStartedResponseData } from "@packages/shared/auth";
import { ApiResponseOptions } from "@packages/shared/common";
import { env } from "@config/env";

export interface AuthNextStepResponse {
    nextStep: "email" | "username" | "password";
}

export default function GetStarted({ next, setNextStep, data }: { next: (next: any) => void, setNextStep: any, data?: any }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<{ usernameOrEmail: string }, any, GetStartedType>({
        resolver: zodResolver(GetStartedSchema),
    });

    const GET_STARTED_API_URI = `${env.NEXT_PUBLIC_AUTH_API_URI!}/get-started`;

    const router = useRouter();
    const { theme } = useTheme();
    const darkTheme = theme === "dark";
    const { canGoBack } = useAppContext();
    const [cacheBeingUsed, setCacheBeingUsed] = useState(false);
    const [signInError, setSignInError] = useState<string>("");

    useEffect(() => {
        if (data?.usernameOrEmail) {
            reset({ usernameOrEmail: data.usernameOrEmail }); // populate with cached data
            setCacheBeingUsed(true);
        }
    }, [data, reset]);


    const onSubmit = async (values: GetStartedType) => {
        setSignInError("");

        try {
            // Call your mock API
            const result = await onGetStarted(values, next);

            // Update next step
            setNextStep(result);

            // Pass actual field values to parent
            next(values);
        } catch (err) {
            console.error(err);
            setSignInError("Failed to proceed. Try again.");
        }
    };

    const onGetStarted = async (reqData: GetStartedType, next: any) => {
        setSignInError("");

        try {
            const result = await fetch(GET_STARTED_API_URI, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    ...reqData,
                }),
            });

            const res: ApiResponseOptions<GetStartedResponseData> = await result.json();
            const data = res.data;

            if (!res.success) {
                setSignInError(res.message || "Failed to sign in.");
                return;
            }

            if (data === undefined) {
                setSignInError("Failed to sign in.");
                return;
            }

            // Update next step
            setNextStep(data.identifierType === "email" ? "verify-email" : "take-username");

            // Pass actual field values to parent
            next(data);

        } catch (error) {
            console.error("SignIn Error:", error);
            setSignInError("An unexpected error occurred. Please try again.");
        }
    };
    return (
        <div
            className={`p-4 w-full h-auto flex items-center justify-start`}
            data-theme={theme}
        >
            <div className="flex flex-col items-center justify-start rounded-[16px] gap-[30px] w-full h-[400px] max-w-[500px]">
                <div className="w-full">
                    {/* This enhances UI/UX */}
                    {canGoBack && (
                        <div onClick={() => router.back()} className="flex items-center justify-end
          w-auto text-[14px] text-text hover:text-gray-500 cursor-pointer hover:bg-hover transition-all duration-300 ease-in-out">X</div>
                    )}
                </div>
                <div className="flex flex-col max-w-[340px] w-full justify-center items-center gap-[8px] mt-50px">
                    <div className="flex flex-col items-center justify-center gap-[14px]">
                        <div
                            className={`font-sans font-semibold text-[26px] text-center text-text w-auto`}
                        >
                            Sign In or Sign Up
                        </div>
                        <div className="font-sans font-small text-text-secondary text-center max-w-[340px] max-h-[50px] px-4 mb-2">
                            You’ll get smarter responses and can upload files, images, and more.
                        </div>
                    </div>
                    <div
                        onClick={() => {
                            const redirectUri = encodeURIComponent("https://yourdomain.com/auth/google/callback");
                            const clientId = "YOUR_GOOGLE_CLIENT_ID";
                            const scope = encodeURIComponent("openid email profile");
                            const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&prompt=select_account`;
                            window.location.href = url;
                        }}
                        className="flex items-center justify-center cursor-pointer gap-[15px] relative w-full max-w-[340px] h-[50px] rounded-[50px] border border-border-secondary border-solid font-sans font-medium hover:bg-bg-btn-hover transition-all duration-300 ease-in-out">
                        <span><Image src="/logos/google-logo-svg.svg" alt="google" width={24} height={24} /></span>
                        <span
                            className="text-text"
                        >
                            Sign in with Google
                        </span>
                    </div>
                    <div className="relative w-full max-w-[340px] h-[1px] mt-[20px] bg-border-secondary">
                        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-primary w-[50px] text-center text-text-gray-muted">OR</p>
                    </div>
                    <form
                        className="my-[20px] flex flex-col items-center justify-start gap-[20px] w-full max-w-[340px] h-auto"
                        method="POST"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <RoundedInputField
                            label="Username or Email"
                            name="usernameOrEmail"
                            register={register}
                            error={errors.usernameOrEmail}
                            theme={darkTheme ? "dark" : "light"}
                            cacheBeingUsed={cacheBeingUsed}
                        />
                        <ClassicButton className="mt-4" />
                    </form>
                </div>
            </div>
        </div>
    );
}