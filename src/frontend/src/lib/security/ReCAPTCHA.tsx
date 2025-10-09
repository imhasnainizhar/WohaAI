"use client"

import ReCAPTCHA from "react-google-recaptcha";
import "@styles/lib/captcha-box.style.css"
import { useRef } from "react";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
if (!RECAPTCHA_SITE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY in environment variables");
}

export default function CAPTCHA ({ onVerify }: { onVerify: (token: string | null) => void }) {
    const recaptchaRef  = useRef<ReCAPTCHA  | null>(null);
    return(
        <ReCAPTCHA className={"custom-theme-dark"} ref={recaptchaRef } sitekey={RECAPTCHA_SITE_KEY!} onChange={onVerify}></ReCAPTCHA>
    );
}