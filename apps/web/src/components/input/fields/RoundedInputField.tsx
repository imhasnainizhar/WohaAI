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
    <div
      className={`w-full max-w-[340px] h-[50px] rounded-[50px] 
        flex items-center justify-center 
        border border-border border-solid 
        text-text
        ${error ? "border-[rgb(255,53,53)]" : null}
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
          className={`
            whitespace-nowrap
            px-1 bg-background text-muted-foreground
            absolute left-6 top-1/2 -translate-y-1/2 transition-all duration-300
            spacing-[2px] rounded-[6px] text-center

            peer-focus:top-0
            peer-focus:text-xs
            peer-focus:text-foreground

            peer-not-placeholder-shown:top-0
            peer-not-placeholder-shown:text-xs    
          `}
        >
          {label}
        </label>

        {error && (
          <Alert
            variant="destructive"
            className="
              absolute top-[40px] left-1
              bg-transparent border-none 
              w-auto h-[25px] text-[13px] my-1
            "
          >
            <AlertCircleIcon />
            <AlertTitle>{error.message}</AlertTitle>
          </Alert>
        )}
      </div>
    </div>
  )
}
