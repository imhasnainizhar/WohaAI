 
 
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import CAPTCHA from "@lib/security/ReCAPTCHA";
import Image from "next/image";
import "@styles/pages/signup.style.css";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@lib/validators/signup-validation-schema";
import { z } from "zod";
import { useRouter } from "next/navigation";
import "react-datepicker/dist/react-datepicker.css";
import { useTheme } from "@providers/ThemeProvider";

type SignUpInput = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const [captchaToken, setCaptchaToken] = useState("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [signUpError, setSignUpError] = useState<string>("");

  const SIGNUP_SERVICE_URI = process.env.NEXT_PUBLIC_SIGNUP_API_URI!;
  const SIGNUP_VALIDATOR_URI = process.env.NEXT_PUBLIC_SIGNUP_VALIDATOR_URI!;

  useEffect(() => {
    if (signUpError) {
      const timer = setTimeout(() => setSignUpError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [signUpError]);

  const onSubmit = async (formData: SignUpInput) => {
    try {
      const captchaRes = await fetch(SIGNUP_SERVICE_URI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captchaToken }),
      });

      const captchaData = await captchaRes.json();

      if (!captchaData.success) {
        setSignUpError("CAPTCHA verification failed.");
        return;
      }

      const completeFormData = { ...formData, rememberMe };

      console.log("Sending signup data:", completeFormData);

      const signUpRes = await fetch(SIGNUP_VALIDATOR_URI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completeFormData),
      });

      const responseJson = await signUpRes.json();

      if (responseJson.ok) {
        localStorage.setItem(
          "tempSignupData",
          JSON.stringify(completeFormData)
        );
        router.push("/auth/verifyUser");

      }
      if (responseJson.emailExist) {
        setSignUpError("Email Already Exists.");
      }
      if (responseJson.error) {
        setSignUpError("Invalid Credentials.");
      }
    } catch (error) {
      setSignUpError("Something Went Wrong.");
    }
  };
  const { theme } = useTheme();
  const darkTheme = theme === "dark";

  return (
    <div
      className={`signup-page ${
        darkTheme
          ? "dark-bg-primary dark-text-secondary"
          : "light-bg-primary light-text-secondary"
      }`}
      data-theme={theme}
    >
      <div className="signup-b">
        <div className="signup-page-content">
          <div className="signup-decor">
            <Image
              src={darkTheme ? "/logos/white_triangle.png" : "/logos/black_triangle.png"}
              alt="Brand Logo"
              width={40}
              height={40}
            />
          </div>
          <div className="signup-credentials">
            <div className="signup-heading">SignUp For Elegence</div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="signup-form"
              autoComplete="on"
            >
              <div className="double-field-group">
                <div
                  className={`input-group ${
                    errors.FirstName ? "has-error" : ""
                  }`}
                  data-theme={theme}
                >
                  <input
                    id="firstName"
                    type="text"
                    {...register("FirstName")}
                    placeholder="   "
                    className={`${
                      darkTheme ? "dark-text-primary" : "light-text-primary"
                    }`}
                  />
                  <label htmlFor="firstName">First Name</label>
                  {errors.FirstName && (
                    <p className="error-text">{errors.FirstName.message}</p>
                  )}
                </div>
                <div
                  className={`input-group ${
                    errors.LastName ? "has-error" : ""
                  }`}
                  data-theme={theme}
                >
                  <input
                    id="secondName"
                    type="text"
                    {...register("LastName")}
                    placeholder="   "
                    className={`${
                      darkTheme ? "dark-text-primary" : "light-text-primary"
                    }`}
                  />
                  <label htmlFor="secondName">Last Name</label>
                  {errors.LastName && (
                    <p className="error-text">{errors.LastName.message}</p>
                  )}
                </div>
              </div>
              <div className="single-field-group">
                <div
                  className={`input-group ${errors.email ? "has-error" : ""}`}
                  data-theme={theme}
                >
                  <input
                    id="email"
                    {...register("email")}
                    placeholder="   "
                    className={`${
                      darkTheme ? "dark-text-primary" : "light-text-primary"
                    }`}
                  />
                  <label htmlFor="email">Email</label>
                  {errors.email && (
                    <p className="error-text">{errors.email.message}</p>
                  )}
                </div>
              </div>
              <div className="double-field-group">
                <div
                  className={`input-group ${
                    errors.password ? "has-error" : ""
                  }`}
                  data-theme={theme}
                >
                  <input
                    id="password"
                    type="password"
                    {...register("password")}
                    placeholder="   "
                    className={`${
                      darkTheme ? "dark-text-primary" : "light-text-primary"
                    }`}
                  />
                  <label htmlFor="password">New Password</label>
                  {errors.password && (
                    <p className="error-text">{errors.password.message}</p>
                  )}
                </div>
                <div
                  className={`input-group ${
                    errors.confirmPassword ? "has-error" : ""
                  }`}
                  data-theme={theme}
                >
                  <input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                    placeholder="   "
                    className={`${
                      darkTheme ? "dark-text-primary" : "light-text-primary"
                    }`}
                  />
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  {errors.confirmPassword && (
                    <p className="error-text">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="signup-captcha">
                <CAPTCHA onVerify={(token) => setCaptchaToken(token || "")} />
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

              <div className={`signup-submit-btn`}>
                <button
                  className={`${
                    darkTheme
                      ? "light-bg-primary light-text-primary"
                      : "dark-bg-primary dark-text-primary"
                  }`}
                  type="submit"
                >
                  Sign Up
                </button>
                {signUpError && (
                  <label className="signup-error-text">{signUpError}</label>
                )}
              </div>

              <div className="link-for-signin">
                <span>Already Have An Account? </span>
                <Link href="/auth/signin">SignIn</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
