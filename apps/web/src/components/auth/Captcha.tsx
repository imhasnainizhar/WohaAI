"use client"

import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";
import { env } from "@wohaai/env-ts";

const RECAPTCHA_SITE_KEY = env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default function CAPTCHA ({ onVerify }: { onVerify: (token: string | null) => void }) {
    const recaptchaRef  = useRef<ReCAPTCHA  | null>(null);
    return(
        <ReCAPTCHA 
        className={"custom-theme-dark"} 
        ref={recaptchaRef } 
        sitekey={RECAPTCHA_SITE_KEY!} 
        onChange={onVerify}
        ></ReCAPTCHA>
    );
}