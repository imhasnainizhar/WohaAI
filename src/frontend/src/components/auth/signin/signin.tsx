"use client"

import { useForm } from "react-hook-form"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useTheme } from "@providers/ThemeProvider"
import { zodResolver } from "@hookform/resolvers/zod"
import { signInSchema } from "@lib/validators/signin-validation-schema"
import Link from "next/link"
import { useAppContext } from "@providers/AppContext"

type SignInInput = z.infer<typeof signInSchema>;


export default function Signin() {
    const { theme } = useTheme()
    const darkTheme = theme === "dark"
    const { signin, setSignin } = useAppContext()

    const router = useRouter()
    const [rememberMe, setRememberMe] = useState<boolean>(false)
    const [signInError, setSignInError] = useState<string>("")

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInInput>({
        resolver: zodResolver(signInSchema),
    });

    const SIGNIN_API_URI = process.env.NEXT_PUBLIC_SIGNIN_API_URI!;

    const onSignIn = async (SignInData: SignInInput) => {
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
        signin && (
            <div className="fixed w-full h-full z-200">
                <div className="flex flex-col items-center justify-center gap-[30px] w-full h-[500px] max-w-[500px] bg-">
                    <div>
                        <div className="text-[20px] cursor-pointer" onClick={() => setSignin(false)}>X</div>
                        <div>
                            <div className="scale-150">
                                <Image
                                    src={
                                        darkTheme
                                            ? "/logos/white_triangle.png" : "/logos/black_triangle.png"
                                    }
                                    alt="WoahAI SignIn"
                                    width={40}
                                    height={40}
                                />
                            </div>
                            <div
                                className={`font-calton font-semibold text-[26px] text-center text-text`}
                            >
                                Welcome Back!
                            </div>

                        </div>
                    </div>
                    <div className="">
                        <form
                            className="my-[20px] flex flex-col items-center justify-between gap-[20px] h-[200px] w-auto"
                            method="POST"
                            onSubmit={handleSubmit(onSignIn)}
                        >
                            <div
                                className={`relative w-[250px] h-[40px] rounded-[12px] flex items-center justify-start border border-(--theme-gray-primary) text-text ${errors.email ? "border border-[rgb(255,53,53)]" : ""}`}
                                data-theme={theme}
                            >
                                <input
                                    placeholder="   "
                                    {...register("email")}
                                    className="w-[15px] h-[20px] bg-transparent text-transparent border border-(--light-dark-gray) cursor-pointer"
                                />
                                <label htmlFor="email">Email</label>
                                {errors.email && (
                                    <p
                                        className="
                    absolute top-1/2 left-[15px] -translate-y-1/2
                    text-[14px] text-(--theme-gray-primary)
                    transition-all duration-300 linear
                    pointer-events-none"
                                    >{errors.email.message}</p>
                                )}
                            </div>

                            <div
                                className={`relative w-[250px] h-[40px] rounded-[12px] flex items-center justify-start text-text border border-(--theme-gray-primary) ${errors.password ? "border border-[rgb(255,53,53)]" : ""}`}
                                data-theme={theme}
                            >
                                <input
                                    placeholder="   "
                                    type="password"
                                    {...register("password")}
                                    className={`w-[15px] h-[20px] bg-transparent text-transparent border border-(--light-dark-gray) cursor-pointer`}
                                />
                                <label htmlFor="password">Password</label>
                                {errors.password && (
                                    <p className="absolute top-[45px] left-[10px] text-[12px] text-[rgb(255,53,53)] w-auto">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="w-full flex items-center justify-center gap-[10px] text-[16px]">
                                <input
                                    id="rememberMe"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-[15px] h-[20px] bg-transparent text-text border border-(--light-dark-gray) cursor-pointer"
                                />
                                <div>Remember Me</div>
                            </div>

                            <div className="w-full flex justify-center bg-transparent border-none">
                                <button
                                    className="
                  w-[150px] h-[40px] 
                  rounded-full
                  text-[16px] font-medium font-calton
                  border-none cursor-pointer
                  transition-all duration-300 linear
                  pointer-events-auto touch-auto
                  hover:bg-(--theme-gray-primary)
                  active:bg-(--theme-dark-black-third)
                  active:duration-0 text-text"
                                    type="submit"
                                >
                                    Sign In
                                </button>
                            </div>

                            {signInError && (
                                <p className="error-textabsolute top-[45px] left-[10px] text-[12px] text-[rgb(255,53,53)] w-auto" style={{ textAlign: "center", marginTop: "10px" }}>
                                    {signInError}
                                </p>
                            )}
                        </form>
                    </div>

                    <div className="mx-[4px] text-text flex gap-2">
                        <span>New Here?</span>
                        <Link href={"/auth/signup"} className="text-link hover:text-link-hover">SignUp</Link>
                    </div>
                </div>

            </div>
        )
    )
}