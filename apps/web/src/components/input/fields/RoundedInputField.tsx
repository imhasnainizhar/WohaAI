import { useState } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

interface InputFieldProps {
  label: string;
  name: string;
  register: any;
  error?: any;
  theme?: string;
  className?: string;
  cacheBeingUsed?: boolean;
}

export const RoundedInputField = ({
  label,
  name,
  register,
  error,
  theme,
  className,
  cacheBeingUsed,
}: InputFieldProps) => {
  const [inputValue, setInputValue] = useState("")

  const hasValue = inputValue.length > 0

  return (
    <div
      className={`w-full max-w-[340px] h-[50px] rounded-[50px] 
        flex items-center justify-center 
        border border-border-secondary border-solid 
        text-text
        ${error ? "border-[rgb(255,53,53)]" : ""}
        ${className || ""}`}
      data-theme={theme}
    >
      <div className="relative flex items-center justify-start w-full max-w-[340px] h-[50px] pl-4">
        <input
          placeholder="   "
          type="text"
          {...register(name)}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)} // 👈 track input dynamically
          className="
            peer w-full h-full bg-transparent cursor-pointer z-20 
            rounded-[50px] font-sans font-small 
            focus:outline-none
          "
        />

        <label
          className={`
            absolute left-6 text-gray-primary transition-all duration-300
            spacing-[2px] w-auto p-1
            ${hasValue || cacheBeingUsed ? "top-0 -translate-y-1/2 text-[12px] text-text-primary left-[25px]" : "top-1/2 -translate-y-1/2"}
            peer-focus:top-0
            peer-focus:-translate-y-1/2
            peer-focus:text-[12px]
            peer-focus:text-text-primary
            peer-focus:left-[25px]
            bg-secondary rounded-[6px] w-10
            text-center
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
