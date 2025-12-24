"use client";

import Image from "next/image";
import "@styles/pages/verify-email.style.css";
import { VerificationCodeSchema } from "@lib/schemas/verification-code";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { useEffect, useState } from "react";
import { signUpSchema } from "@lib/schemas/signup-validation";
import { useRouter } from "next/navigation";

type VerificationCodeValidator = z.infer<typeof VerificationCodeSchema>;
type SignUpInput = z.infer<typeof signUpSchema>;

export default function VerifyEmail() {
  const [verifyEmailError, setVerifyEmailError] = useState<string>("");
  const [completeUserData, setCompleteUserData] = useState<SignUpInput | null>(null);
  const [resendCooldown, setResendCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationCodeValidator>({
    resolver: zodResolver(VerificationCodeSchema),
  });

  const CODE_MAILER_URI = process.env.NEXT_PUBLIC_VERIFICATION_CODE_MAILER_URI!;
  const SIGNUP_SERVICE_URI = process.env.NEXT_PUBLIC_SIGNUP_API_URI!;
  const USER_CODE_VERIFICATION_URI = process.env.NEXT_PUBLIC_CODE_VERIFICATION_API_URI!;

  useEffect(() => {
    const formDataStr = localStorage.getItem("tempSignupData");
    if (formDataStr) {
      try {
        const parsed: SignUpInput = JSON.parse(formDataStr);
        setCompleteUserData(parsed);
      } catch {
        console.error("Invalid JSON in tempSignupData");
      }
    }
  }, []);

  useEffect(() => {
    if (completeUserData?.email) {
      resendCooldownTimer();
    }
  }, [completeUserData]);

  useEffect(() => {
    if (!resendCooldown) return;

    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

  const resendCooldownTimer = () => {
    if (resendCooldown || !completeUserData?.email) return;

    setResendCooldown(true);
    setCooldownSeconds(60);

    fetch(CODE_MAILER_URI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: completeUserData.email }),
    }).catch((err) => console.error("Resend failed", err));
  };

  const onVerify = async (data: VerificationCodeValidator) => {
    console.log("✅ onVerify called with:", data);
    setWasSubmitted(true);
    setVerifyEmailError("");

    if (!completeUserData) {
      console.error("❌ No user data found.");
      return;
    }

    try {
      const codeVerificationRes = await fetch(USER_CODE_VERIFICATION_URI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: completeUserData.email,
          verificationCode: data.verificationCode,
        }),
      });

      if (!codeVerificationRes.ok) {
        const err = await codeVerificationRes.json();
        console.error("❌ Verification failed:", err);
        setVerifyEmailError("Invalid Verification Code");
        return;
      }

      const signUpRes = await fetch(SIGNUP_SERVICE_URI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completeUserData),
        credentials: "include",
      });
      if (signUpRes.ok) {
        localStorage.removeItem("tempSignupData");
        router.push("/");
        setTimeout(() => {
          window.location.reload();
        }, 450);
      } else {
        setVerifyEmailError("Signup Failed, Please Try Again.");
      }
    } catch (error) {
      setVerifyEmailError("Server Error, Please Try Again Later.");
    }
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-dialogue">
        <div className="verify-page-logo">
          <Image src="/BrandLogo2.png" alt="brand logo picture" width={40} height={40} />
        </div>

        <div className="email-verify-page-heading">Verify Your Email</div>

        <div className="email-verify-page-statement">
          Welcome Dear <span>{completeUserData?.FirstName}</span>, Please verify your email{" "}
          <span>{completeUserData?.email}</span> to proceed.
        </div>

        <form
          className="email-verify-page-form"
          autoComplete="off"
          onSubmit={handleSubmit(onVerify, (formErrors) => {
            setWasSubmitted(true);
            console.warn("❌ Form blocked due to validation errors:", formErrors);
          })}
        >
          <div
            className={
              wasSubmitted && (verifyEmailError || errors.verificationCode)
                ? "has-error input-group"
                : "input-group"
            }
          >
            <input
              id="verificationCode"
              {...register("verificationCode")}
              placeholder="   "
              autoComplete="off"
              aria-invalid={!!errors.verificationCode}
            />
            <label htmlFor="verificationCode">Verification Code</label>

            {wasSubmitted && errors.verificationCode ? (
              <p className="error-text">
                {errors.verificationCode.message || "Verification code is required"}
              </p>
            ) : verifyEmailError ? (
              <p className="error-text">{verifyEmailError}</p>
            ) : null}
          </div>

          <div className="resend-btn-box">
            <button
              type="button"
              onClick={resendCooldownTimer}
              disabled={resendCooldown}
              className={resendCooldown ? "disable-resend-btn" : "resend-btn"}
            >
              {resendCooldown ? `Resend in ${cooldownSeconds}s` : "Resend Code"}
            </button>
          </div>

          <div className="verify-email-button">
            <button type="submit">Verify</button>
          </div>
        </form>
      </div>
    </div>
  );
}
