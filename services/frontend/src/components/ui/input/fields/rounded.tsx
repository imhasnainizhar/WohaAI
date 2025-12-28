import { Alert, AlertTitle } from "@lib/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

interface InputFieldProps {
    label: string;
    name: string;
    register: any;
    error?: any;
    theme?: string;
    className?: string;
    value?: string;
}

export const RoundedInputField = ({
    label,
    name,
    register,
    error,
    theme,
    className,
    value,
}: InputFieldProps) => {
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
                    readOnly
                    value={value}
                    {...register(name)}
                    className="
            peer w-full h-full bg-transparent cursor-pointer z-20 
            rounded-[50px] font-sans font-small 
            focus:outline-none
          "
                />

                <label
                    className="
            absolute left-6 text-[16px] text-gray-400 transition-all duration-300
            spacing-[2px] w-auto p-1

            top-1/2 -translate-y-1/2

            peer-focus:top-0 
            peer-focus:-translate-y-1/2 
            peer-focus:text-[12px]
            peer-focus:text-text-primary 
            peer-focus:left-[25px] 
            bg-bg-primary rounded-[6px] w-10

            peer-placeholder-shown:top-1/2 
            peer-placeholder-shown:-translate-y-1/2 
            peer-placeholder-shown:text-text-gray-muted 
            text-center
          "
                >
                    {label}
                </label>

                {error && (
                    <Alert
                        variant="destructive"
                        className="
              absolute top-[55px] left-3.5 
              bg-transparent border-none 
              w-[200px] h-[50px] text-[15px]
            "
                    >
                        <AlertCircleIcon />
                        <AlertTitle>{error.message}</AlertTitle>
                    </Alert>
                )}
            </div>
        </div>
    );
};
