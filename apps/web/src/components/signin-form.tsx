"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@/providers/ThemeProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SigninRequestSchema, SigninRequest } from "@packages/contracts/auth"
import z from "zod";
import { Alert, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { FieldGroup, Field, FieldSeparator, FieldLabel, FieldDescription } from "./ui/field";
import { Input } from "./ui/input";
import Link from "next/link";
import FloatingInput from "./input/fields/FloatingInput";

type SigninInput = z.input<typeof SigninRequestSchema>;
type SigninOutput = z.output<typeof SigninRequestSchema>;

export default function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninInput, any, SigninOutput>({
    resolver: zodResolver(SigninRequestSchema),
  });

  const router = useRouter();
  const { theme } = useTheme();

  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [signInError, setSignInError] = useState<string>("");

  const SIGNIN_API_URI = process.env.NEXT_PUBLIC_SIGNIN_API_URI!;

  const onSignIn = async (SigninData: SigninRequest) => {
    setSignInError("");

    try {
      const res = await fetch(SIGNIN_API_URI, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...SigninData,
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className={`rounded-[25px] py-8 px-2`}>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                {/* <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Apple
                </Button> */}
                <Button variant="wohaOutline" type="button">
                  <Image src={"/logos/google-logo-svg.svg"} alt="  " width={20} height={20} />
                  Login with Google
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <FloatingInput
                  id="email"
                  label="Email"
                  type="email"
                />
              </Field>

              <Field>
                <FloatingInput
                  id="password"
                  label="Password"
                  type="password"
                />
                {/* <div className={`flex items-center mb-2`}>
                  <a
                    href="#"
                    className="ml-auto mr-auto text-sm underline-offset-3 hover:underline text-link"
                  >
                    Forgot your password?
                  </a>
                </div> */}
              </Field>
              <Field>
                <Button type="submit">Login</Button>
                <FieldDescription className="text-center flex items-center justify-center gap-10 text-link ">
                  <Link href="/forgot-password">Forgot Password?</Link>
                  <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-4 text-center text-[9px]! text-muted-foreground">
        By continuing, you acknowledge WohaAI’s <Link href="/terms">Terms of Service</Link>{" "}
        and <Link href="/privacy">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  )
}