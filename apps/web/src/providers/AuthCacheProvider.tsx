"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { SignupFormCache } from "@packages/contracts/auth";

type SignupContextType = {
  step: number;
  setStep: (step: number) => void;
  nextStep: "username" | "email" | "password" | null;
  setNextStep: (step: "username" | "email" | "password" | null) => void;
  form: SignupFormCache;
  setForm: (form: Partial<SignupFormCache>) => void;
};

const AuthCacheContext = createContext<SignupContextType | undefined>(undefined);

export function AuthCacheProvider({ children }: { children: ReactNode }) {
  const [step, setStepState] = useState(0);
  const [nextStep, setNextStepState] = useState<"username" | "email" | "password" | null>(null);
  const [form, setFormState] = useState<SignupFormCache>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    dateOfBirth: new Date(),
  });

  const setForm = (values: Partial<SignupFormCache>) => {
    setFormState((prev) => ({ ...prev, ...values }));
  };

  const setStep = (s: number) => setStepState(s);
  const setNextStep = (s: "username" | "email" | "password" | null) => setNextStepState(s);

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
