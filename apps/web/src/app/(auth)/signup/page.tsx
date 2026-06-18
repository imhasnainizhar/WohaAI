import SignupComposer from "@/components/auth/signup/SignupComposer";

export default function SignUp() {

  return (
    <div className="grid min-h-svh lg:grid-cols-2 font-reading">
      <div className="flex justify-between gap-4 px-6 pb-6 pt-6.5! md:p-10">
        <div className={`flex-1 flex flex-col items-center justify-center`}>
          <div className={`flex flex-col items-center justify-center gap-3.5`}>
            <div
              className={`font-gerogia-sans font-medium text-[40px] leading-tight text-center text-text w-auto`}
            >
              Think Fast <br />
              Craft Faster
            </div>
            <div className="font-small text-secondary-foreground text-fluid-base text-center max-w-[340px] max-h-12.5 px-4 mb-2">
              Join WohaAI and start creating with AI.
            </div>
          </div>
          <div className={`w-full flex items-center justify-center`}>
            <div className="w-full max-w-90">
              <SignupComposer />
            </div>
          </div>
        </div>
      </div>
      <div className={`hidden lg:block w-full h-full`}>

      </div>
    </div>
  )
}
