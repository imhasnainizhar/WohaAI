"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { SigninForm, SignupForm } from "@/types/auth";

export type SigninNextStep = "usernameOrEmail" | "password" | null;
export type SignupNextStep = "username" | "email" | "email_verification" | "password" | "complete_signup"
export type AuthNextStep = SigninNextStep | SignupNextStep

type AuthContextType = {
  step: number;
  setStep: (step: number) => void;
  nextStep: AuthNextStep;
  setNextStep: (step: AuthNextStep) => void;
  form: SigninForm | SignupForm;
  setForm: (form: Partial<SigninForm | SignupForm>) => void;
};

const AuthCacheContext =
  createContext<AuthContextType | undefined>(undefined);

export function AuthCacheProvider({ children }: { children: ReactNode }) {
  const [step, setStepState] = useState(0);
  const [nextStep, setNextStepState] = useState<AuthNextStep>(null);

  /**
   * State is set for both signup and signin form and only
   * relavent state is used in component forms.
   */
  const [form, setFormState] = useState<SigninForm | SignupForm>({
    usernameOrEmail: "",
    password: "",
    username: "",
    email: "",
    confirmPassword: "",
  } as SigninForm | SignupForm);

  const setForm = (values: Partial<SigninForm | SignupForm>) => {
    setFormState((prev) => ({ ...prev, ...values }));
  };

  const setStep = (s: number) => setStepState(s);
  const setNextStep = (s: AuthNextStep) => setNextStepState(s);

  return (
    <AuthCacheContext.Provider value={{ step, setStep, nextStep, setNextStep, form, setForm }}>
      {children}
    </AuthCacheContext.Provider>
  );
}

export function useAuthCache() {
  const context = useContext(AuthCacheContext);
  if (!context) throw new Error("useAuthCache must be used within a AuthCacheProvider");
  return context;
}
