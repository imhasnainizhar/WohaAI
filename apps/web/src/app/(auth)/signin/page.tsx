"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@/providers/ThemeProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SigninRequestSchema, SignInRequest } from "@packages/contracts/auth"
import z from "zod";
import { Alert, AlertTitle } from "@/components/ui/Alert"
import { AlertCircleIcon } from "lucide-react"

type SigninIUnput = z.input<typeof SigninRequestSchema>;
type SigninOutput = z.output<typeof SigninRequestSchema>;

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninIUnput, any, SigninOutput>({
    resolver: zodResolver(SigninRequestSchema),
  });

  const router = useRouter();
  const { theme } = useTheme();
  const darkTheme = theme === "dark";

  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [signInError, setSignInError] = useState<string>("");

  const SIGNIN_API_URI = process.env.NEXT_PUBLIC_SIGNIN_API_URI!;

  const onSignIn = async (SignInData: SignInRequest) => {
    setSignInError("");

    try {
      const res = await fetch(SIGNIN_API_URI, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...SignInData,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSignInError(data.message || "Failed to sign in.");
        return;
      }
      router.push("/");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("SignIn Error:", error);
      setSignInError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div
      className={`w-full h-[750px] flex items-center justify-center bg-bg-primary`}
      data-theme={theme}
    >

      <div className="p-6 flex flex-col items-center justify-center rounded-[16px] gap-[30px] w-full h-[500px] max-w-[500px]">
        <div className="w-full">
          <div onClick={() => router.back()} className="flex items-center justify-end
          w-auto text-[14px] text-text hover:text-gray-500 cursor-pointer hover:bg-hover transition-all duration-300 ease-in-out">X</div>
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
            onSubmit={handleSubmit(onSignIn)}
          >
            <div
              className={`w-full max-w-[340px] h-[50px] rounded-[50px] flex items-center justify-center border border-border-secondary border-solid text-text ${errors.usernameOrEmail ? "border border-[rgb(255,53,53)]" : ""}`}
              data-theme={theme}
            >
              <div className="relative flex items-center justify-start w-full max-w-[340px] h-[50px] pl-4">
                <input
                  placeholder="   "
                  {...register("usernameOrEmail")}
                  className="peer w-full h-full bg-transparent cursor-pointer z-20 rounded-[50px] font-sans font-small focus:outline-none"
                />
                <label
                  htmlFor="email"
                  className="
                    absolute left-6
                    text-[16px]
                    text-gray-400
                    transition-all duration-300
                    spacing-[2px]

                    /* Start state */
                    top-1/2 -translate-y-1/2

                    /* When typing OR focused */
                    peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[12px]
                    peer-focus:text-text-primary peer-focus:left-[25px] bg-bg-primary rounded-[6px] w-10
                    peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 text-center
                    peer-placeholder-shown:text-text-gray-muted
                ">
                  Email
                </label>
                {errors.usernameOrEmail && (
                  <Alert variant="destructive" className="absolute top-[55px] left-3.5 bg-transparent border-none w-[200px] h-[50px] text-[15px]">
                    <AlertCircleIcon />
                    <AlertTitle>{errors.usernameOrEmail.message}</AlertTitle>
                  </Alert>
                )}
              </div>
            </div>
            <div className="w-full flex justify-center bg-transparent border-none">
              <button
                className="
                  w-[150px] h-10 btn-text-color btn-bg-color
                  rounded-full
                  text-[16px]
                  border-none cursor-pointer font-sans font-medium
                  pointer-events-auto touch-auto
                  hover:bg-btn-hover
                  active:bg-(--theme-dark-black-third)
                  active:duration-0 hover:bg-btn-hover active:bg-btn-active transition-all duration-300 linear"
                type="submit"
              >
                Continue
              </button>
            </div>

            {signInError && (
              <p className="error-textabsolute top-[45px] left-2.5 text-[12px] text-[#ff3535] w-auto" style={{ textAlign: "center", marginTop: "10px" }}>
                {signInError}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
