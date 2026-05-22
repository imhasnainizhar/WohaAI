"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignupEmailSchema,
  SignupPasswordSchema,
  SignupPersonalInfoSchema,
  SignupUsernameSchema 
} from "@lib/schemas/signup";
import SignupPersonalInfo from "./signup/SignupPersonalInfo";
import { LeftArrowButton } from "@components/ui/buttons/LeftArrowButton";
import { GetStartedSchema } from "@lib/schemas/get-started";
import GetStarted from "./signup/GetStarted";
import SignupEmail from "./signup/SignupEmail";
import SignupUsername from "./signup/SignupUsername";
import SignupPassword from "./signup/SignupPassword";
import { useAuthCache } from "@providers/AuthCacheProvider";
import { AuthForm } from "@internals/types/auth";

export default function SignupFlow() {
  const { step, setStep, nextStep, setNextStep, form, setForm } = useAuthCache();
  const dataForm = form as AuthForm;
  const [direction, setDirection] = useState<1 | -1>(1);

  const steps = [
    { name: "", schema: GetStartedSchema, render: (next: (v: any) => void) => <GetStarted next={next} setNextStep={setNextStep} data={form} /> },
    {
      name: nextStep === "email" ? "Email" : nextStep === "username" ? "Username" : "Password",
      schema: nextStep === "email" ? SignupEmailSchema : nextStep === "username" ? SignupUsernameSchema : SignupPasswordSchema,
      render: (next: (v: any) => void) =>
        nextStep === "email"
          ? <SignupEmail next={next} data={{email: dataForm.email}} />
          : nextStep === "username"
          ? <SignupUsername next={next} data={{username: dataForm.username}} />
          : <SignupPassword next={next} />
    },
    { name: "Personal Info", schema: SignupPersonalInfoSchema, render: (next: (v: any) => void) => <SignupPersonalInfo next={next} data={{firstName: dataForm.firstName, lastName: dataForm.lastName, dateOfBirth: dataForm.dateOfBirth}} /> },
    { name: "Password", schema: SignupPasswordSchema, render: (next: (v: any) => void) => <SignupPassword next={next} /> },
  ];

  const next = (values: any) => {
    const merged = { ...form, ...values };
    setDirection(1);
    setForm(merged);
    if (nextStep === null) {
      console.log("Internal Server Error, Signup step null")
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
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: 1 | -1) => ({
      x: dir === 1 ? -40 : 40,
      opacity: 0
    })
  }

  const current = steps[step];

  return (
    <div className="w-full h-full flex items-center justify-center bg-bg-primary">
      <div className="p-6 flex flex-col items-center justify-center rounded-[16px] gap-[30px] w-[450px] h-[400px]">
        <div className="relative w-full flex items-center justify-center">
          {step > 0 && (
            <LeftArrowButton
              onClick={back}
              className="absolute left-[40px] cursor-pointer w-[25px] h-[25px] flex items-center justify-center"
            />
          )}
          <div className="font-sans font-semibold text-[22px] text-center text-text w-auto">{current.name}</div>
        </div>
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
                {/* We are providing next function here so component can 
                natively handle zod validation and api calls before going to next step */}
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
