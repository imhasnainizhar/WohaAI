"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LeftArrowButton } from "@/components/ui/buttons/LeftArrowButton";
import SignupEmail from "./SignupEmail";
import SignupUsername from "./SignupUsername";
import SignupPassword from "./SignupPassword";
import EmailVerification from "./SignupEmail";
import SignupComplete from "./SignupComplete";
import { useAuthCache } from "@/providers/AuthCacheProvider";

export default function SignupComposer() {
  const { step, setStep, nextStep, setNextStep, form, setForm } = useAuthCache();
  const [direction, setDirection] = useState<1 | -1>(1);

  const steps = [
    {
      name: "Username",
      render: (next: (v: any) => void) => (
        <SignupUsername next={next} setNextStep={setNextStep} data={form} />
      ),
    },
    {
      name: "Email",
      render: (next: (v: any) => void) => (
        <SignupEmail next={next} setNextStep={setNextStep} data={form} />
      ),
    },
    {
      name: "Email Verification",
      render: (next: (v: any) => void) => (
        <EmailVerification next={next} setNextStep={setNextStep} data={form} />
      ),
    },
    {
      name: "Password",
      render: (next: (v: any) => void) => (
        <SignupPassword next={next} setNextStep={setNextStep} />
      ),
    },
    {
      name: "Complete",
      render: (next: (v: any) => void) => (
        <SignupComplete next={next} setNextStep={setNextStep} data={form} />
      ),
    },
  ];

  const next = (values: any) => {
    const merged = { ...form, ...values };
    setDirection(1);
    setForm(merged);
    if (nextStep === null) {
      console.log("Internal Server Error, Signup step null");
      return null;
    }
    setStep(Math.min(step + 1, steps.length - 1));
  };

  const back = () => {
    setDirection(-1);
    setStep(Math.max(step - 1, 0));
  };

  const variants = {
    enter: (dir: 1 | -1) => ({
      x: dir === 1 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: 1 | -1) => ({
      x: dir === 1 ? -40 : 40,
      opacity: 0,
    }),
  };

  const current = steps[step];

  return (
    <div className="w-full h-full flex items-center justify-center bg-none">
      <div className="p-6 pt-0 flex flex-col items-center justify-center rounded-[16px] gap-[30px] w-[450px]">
        {step > 0 && (
          <div className="relative w-full flex items-center justify-center">
            <LeftArrowButton
              onClick={back}
              className="absolute left-[40px] cursor-pointer w-[25px] h-[25px] flex items-center justify-center"
            />
            <div className="font-sans font-semibold text-[22px] text-center text-text w-auto">
              {current?.name}
            </div>
          </div>
        )}
        <div className="w-full">
          <div className="w-full flex items-center justify-center flex-col">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                className="w-full"
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45 }}
              >
                {current?.render(next)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
