"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignupPersonalInfoSchema } from "@lib/schemas/signup";
import SignupPersonalInfo from "./personal";
import ClassicButton from "@components/ui/buttons/classic-button";
import { LeftArrowButton } from "@components/ui/buttons/left-arrow";
import { GetStartedSchema } from "@lib/schemas/get-started";
import GetStarted from "../common/get-started";

export default function SignupFlow() {
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
  });

  const steps = [
    {
      name: "",
      schema: GetStartedSchema,
      render: (next: (next: any) => void) => <GetStarted next={next} />
    },
    {
      name: "Personal Info",
      schema: SignupPersonalInfoSchema,
      render: (next: (next: any) => void) => <SignupPersonalInfo next={next} />
    },
    {
      render: (next: (next: any) => void) => <SignupPersonalInfo next={next} />
    },
    {
      render: (next: (next: any) => void) => <SignupPersonalInfo next={next} />
    },
  ];

    const next = (values: any) => {
    const merged = { ...form, ...values };
    setForm(merged);

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      console.log("🔥 SUBMIT:", merged);
      // send to backend
    }
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const current = steps[step];

  return (
    <div className="w-full h-full flex items-center justify-center bg-bg-primary">
      <div className="p-6 flex flex-col items-center justify-center rounded-[16px] gap-[30px] w-[450px] h-[400px]">
        <div className="relative w-full flex items-center justify-center">
          {step > 0 && (
            <LeftArrowButton
              onClick={() => { }}
              className="absolute left-[40px] cursor-pointer w-[25px] h-[25px] flex items-center justify-center"
            />
          )}
          <div className="font-sans font-semibold text-[22px] text-center text-text w-auto">{current.name}</div>
        </div>
        <div className="w-full">
          <div className="w-full flex items-center justify-center flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                className="w-full"
                key={step}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
              >
                {current.render(next)}
                <p className="text-center mt-3 text-sm opacity-70">
                  Step {step + 1} of {steps.length}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
