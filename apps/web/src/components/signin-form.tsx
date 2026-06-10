"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SigninRequestSchema, SigninRequest } from "@packages/contracts/auth"
import z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { FieldGroup, Field, FieldSeparator, FieldDescription } from "./ui/field";
import Link from "next/link";
import { FloatingInput } from "./input/fields/FloatingInput";
import { FaApple } from "react-icons/fa";

type SigninInput = z.input<typeof SigninRequestSchema>;
type SigninOutput = z.output<typeof SigninRequestSchema>;

export default function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SigninInput, any, SigninOutput>({
    resolver: zodResolver(SigninRequestSchema),
  });

  // console.log(`Form Errors: ${JSON.stringify(errors)}`);

  const username = watch("usernameOrEmail");

  console.log(username);

  const router = useRouter();

  const [signInError, setSignInError] = useState<string>("");

  const SIGNIN_API_URI = process.env.NEXT_PUBLIC_SIGNIN_API_URI!;

  const onSignIn = async (SigninData: SigninRequest) => {
    setSignInError("");

    try {
      console.log("calling signin api")
      const res = await fetch(SIGNIN_API_URI, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...SigninData,
        }),
      });

      const data = await res.json();
      console.log(data)

      if (!res.ok) {
        setSignInError(data.message || "Failed to sign in.");
        console.log(data.message)
        return;
      }
      console.log("signin successfull")
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
    <div className={cn("w-full flex flex-col gap-6", className)} {...props}>
      <Card className={`rounded-[35px] py-8 px-2 border-none! shadow-none!`}>
        <CardContent className={`px-3.5 md:px-6`}>
          <FieldGroup className={`gap-4!`}>
            <Field>
              <Button variant="wohaOutline" type="button" className={`border-border!`}>
                <Image src={"/logos/google-logo-svg.svg"} alt="  " width={20} height={20} />
                Login with Google
              </Button>
              <Button variant="wohaOutline" type="button" className={`border-border!`}>
                <FaApple className={`h-5 w-5`} />
                Login with Apple
              </Button>
            </Field>
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card my-2">
              Or continue with
            </FieldSeparator>
            <form onSubmit={handleSubmit(onSignIn)} method="post">
              <div className={`flex flex-col gap-4`}>
              <Field>
                <FloatingInput
                  id="usernameOrEmail"
                  label="Username or Email"
                  error={errors.usernameOrEmail}
                  {...register("usernameOrEmail")}
                />
              </Field>
              <Field>
                <Button type="submit" className={`bg-primary text-primary-foreground! text-fluid-base font-semibold hover:bg-primary/70! transition-all ease-in-out duration-300 cursor-pointer`}>Continue</Button>
              </Field>
              </div>
            </form>
          </FieldGroup>
        </CardContent>
      </Card>
      <FieldDescription className="px-4 text-center text-[10px]! text-muted-foreground">
        By continuing, you acknowledge WohaAI’s <br /><Link href="/terms">Terms of Service</Link>{" "}
        and <Link href="/privacy">Privacy Policy</Link>
      </FieldDescription>
    </div>
  )
}