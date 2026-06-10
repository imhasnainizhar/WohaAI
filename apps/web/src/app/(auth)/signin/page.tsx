"use client";

import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SigninRequestSchema, SigninRequest } from "@packages/contracts/auth"
import z from "zod";
import { useThemeUtils } from '@/providers/ThemeProvider';
import { Alert, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon, GalleryVerticalEnd } from "lucide-react"
import SigninForm from "@/components/signin-form";

type SigninIUnput = z.input<typeof SigninRequestSchema>;
type SigninOutput = z.output<typeof SigninRequestSchema>;

export default function SignIn() {

  const { isDarkTheme } = useThemeUtils()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninIUnput, any, SigninOutput>({
    resolver: zodResolver(SigninRequestSchema),
  });

  const router = useRouter();

  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [signInError, setSignInError] = useState<string>("");

  const SIGNIN_API_URI = process.env.NEXT_PUBLIC_SIGNIN_API_URI!;

  const onSignIn = async (SignInData: SigninRequest) => {
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
    <div className="grid min-h-svh lg:grid-cols-2 font-reading">
      <div className="flex flex-col justify-between gap-4 px-6 pb-6 pt-6.5! md:p-10">
        <div className="flex justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex items-center justify-center">
              <Image src={isDarkTheme ? "/logos/white_triangle.png" : "/logos/black_triangle.png"} alt=" " width={28} height={28} />
            </div>
            <span className={`leading-tight! font-bold font-gerogia-sans`}>WohaAI</span>
          </Link>
        </div>
        <div>
          <div className={`flex flex-col items-center justify-center gap-[14px]`}>
            <div
              className={`font-gerogia-sans font-medium text-[40px] leading-tight text-center text-text w-auto`}
            >
              Think Fast <br />
              Craft Faster
            </div>
            <div className="font-small text-secondary-foreground text-fluid-base text-center max-w-[340px] max-h-[50px] px-4 mb-2">
              Get more with WohaAI Agentic Thinking.
            </div>
          </div>
          <div className={`flex flex-1 items-end justify-center`}>
            <div className="w-full max-w-[360px]">
              <SigninForm />
            </div>
          </div>

        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        {/* <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        /> */}
      </div>
    </div>
  )
}

