import { useState } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { InputFieldProps } from "@/types/input-props";

export const RoundedInputField = ({
  label,
  error,
  className,
  ...props
}: InputFieldProps) => {

  return (
    <div className={`flex flex-col items-start gap-2`}>
    <div
      className={`w-full max-w-[340px] h-[50px] rounded-[50px] 
        flex items-center justify-center 
        border border-border border-solid 
        text-text
        ${error ? "border-[#FF657B] focus:border-[#FF657B]" : null}
        ${className || null}`}
    >
      <div className="relative flex items-center justify-start w-full max-w-[340px] h-[50px] pl-4">
        <input
          placeholder="   "
          className="
            peer w-full h-full bg-transparent cursor-pointer z-20 
            rounded-[50px] font-sans font-small 
            focus:outline-none
          "
          {...props}
        />

            <label
                htmlFor={props.id}
                className={`
                    whitespace-nowrap
                    absolute top-1/2 -translate-y-1/2 left-3 px-2 bg-background! text-muted-foreground
                    transition-all [transition:all_300ms_ease,color_100ms_ease] pointer-events-none
                    rounded-[20px]

                    peer-focus:top-0
                    peer-focus:text-xs
                    peer-focus:text-foreground

                    peer-not-placeholder-shown:top-0
                    peer-not-placeholder-shown:text-xs

                    ${error ? "text-[#FF657B]!" : null}
                `}
            >
                {label}
            </label>
      </div>
    </div>
            {error && (
          <Alert
            variant="destructive"
            className="
              bg-transparent border-none 
              w-auto my-1
            "
          >
            <AlertCircleIcon />
            <AlertTitle className={`text-[11px]! pt-0.5`}>{error.message}</AlertTitle>
          </Alert>
        )}
    </div>
  )
}
