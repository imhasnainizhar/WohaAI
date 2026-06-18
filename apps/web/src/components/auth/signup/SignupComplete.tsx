"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup, Field, FieldDescription } from "@/components/ui/field";

interface SignupCompleteProps {
    next: (values: any) => void;
    setNextStep: (step: "username" | "email" | "email_verification" | "password" | "complete_signup") => void;
    data?: any;
}

export default function SignupComplete({
    next,
    setNextStep,
    data,
}: SignupCompleteProps) {
    const router = useRouter();

    const handleComplete = async () => {
        try {
            const res = await fetch("/api/auth/signup/complete", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const responseData = await res.json();

            if (!res.ok) {
                console.error("Signup complete error:", responseData.message);
                return;
            }

            if (responseData.success) {
                router.push("/");
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } catch (err) {
            console.error("Signup complete error:", err);
        }
    };

    return (
        <div className="w-full flex flex-col gap-6">
            <Card className={`rounded-[35px] border-none! shadow-none!`}>
                <CardContent className={``}>
                    <FieldGroup className={`gap-4!`}>
                        <div className={`flex flex-col gap-4 items-center justify-center`}>
                            <div className="text-center">
                                <h2 className="text-2xl font-semibold mb-2">Signup Complete!</h2>
                                <p className="text-muted-foreground">Your account has been created successfully.</p>
                            </div>
                            <Field>
                                <Button
                                    onClick={handleComplete}
                                    className={`bg-primary text-primary-foreground! text-fluid-base font-semibold hover:bg-primary/70! transition-all ease-in-out duration-300 cursor-pointer`}
                                >
                                    Continue to Dashboard
                                </Button>
                            </Field>
                        </div>
                    </FieldGroup>
                </CardContent>
            </Card>
            <FieldDescription className="px-4 text-center text-[10px]! text-muted-foreground">
                Welcome to WohaAI!
            </FieldDescription>
        </div>
    );
}
