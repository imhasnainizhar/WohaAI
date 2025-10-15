"use client";

import Image from "next/image";
import "@styles/pages/signin.style.css";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@lib/validators/signin-validation-schema";
import { useTheme } from "@providers/ThemeProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import z from "zod";

type SignInInput = z.infer<typeof signInSchema>;

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const router = useRouter();
  const { theme } = useTheme();
  const darkTheme = theme === "dark";

  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [signInError, setSignInError] = useState<string>("");

  const SIGNIN_API_URI = process.env.NEXT_PUBLIC_SIGNIN_API_URI;

  const onSignIn = async (SignInData: SignInInput) => {
    setSignInError("");

    try {
      console.log("SIGNIN_API_URI:", SIGNIN_API_URI);
      const res = await fetch(`http://localhost:8000/signin`, {
        method: "POST",
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
      className={`signin-page ${darkTheme
        ? "dark-bg-primary dark-text-secondary"
        : "light-bg-primary light-text-secondary"
        }`}
      data-theme={theme}
    >
      <div className="signin-page-content">
        <div className="signin-decor">
          <Image
            src={
              darkTheme
                ? "/logos/white_triangle.png" : "/logos/black_triangle.png"
            }
            alt="Brand Logo"
            width={40}
            height={40}
          />
        </div>

        <div className="signin-input-fields">
          <div
            className={`signin-page-heading ${darkTheme ? "dark-text-primary" : "light-text-primary"
              }`}
          >
            SignIn To Elegence
          </div>

          <form
            className="signin-credential-box"
            method="POST"
            onSubmit={handleSubmit(onSignIn)}
          >
            <div
              className={`input-group ${errors.email ? "has-error" : ""}`}
              data-theme={theme}
            >
              <input
                placeholder="   "
                {...register("email")}
                className={`${darkTheme ? "dark-text-primary" : "light-text-primary"
                  }`}
              />
              <label htmlFor="email">Email</label>
              {errors.email && (
                <p className="error-text">{errors.email.message}</p>
              )}
            </div>

            <div
              className={`input-group ${errors.password ? "has-error" : ""}`}
              data-theme={theme}
            >
              <input
                placeholder="   "
                type="password"
                {...register("password")}
                className={`${darkTheme ? "dark-text-primary" : "light-text-primary"
                  }`}
              />
              <label htmlFor="password">Password</label>
              {errors.password && (
                <p className="error-text">{errors.password.message}</p>
              )}
            </div>

            <div className="signupRemember">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <div>Remember Me</div>
            </div>

            <div className="signin-submit-btn">
              <button
                className={`${darkTheme
                  ? "light-bg-primary light-text-primary"
                  : "dark-bg-primary dark-text-primary"
                  }`}
                type="submit"
              >
                Sign In
              </button>
            </div>

            {signInError && (
              <p className="error-text" style={{ textAlign: "center", marginTop: "10px" }}>
                {signInError}
              </p>
            )}
          </form>
        </div>

        <div className="link-for-signup">
          <span>New Here?</span>
          <Link href={"/auth/signup"}>SignUp</Link>
        </div>
      </div>
    </div>
  );
}
