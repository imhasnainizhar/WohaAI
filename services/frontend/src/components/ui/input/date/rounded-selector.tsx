import { forwardRef } from "react"
import { Alert, AlertTitle } from "@lib/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"

interface DataSelectorProps {
  value: string
  label: string
  error?: any
  theme?: string
  className?: string
}

// forwardRef to allow PopoverTrigger to attach ref & handlers
export const RoundedDataSelector = forwardRef<
  HTMLDivElement,
  DataSelectorProps & React.HTMLAttributes<HTMLDivElement>
>(({ value, label, error, theme, className, ...rest }, ref) => {
  const hasValue = !!value

  return (
    <div
      ref={ref} 
      {...rest}    // includes onClick from trigger
      className={`
        w-full max-w-[340px] h-[50px] rounded-[50px] 
        flex items-center justify-center 
        border border-border-secondary border-solid 
        text-text
        ${error ? "border-[rgb(255,53,53)]" : ""}
        ${className || ""}
      `}
      data-theme={theme}
    >
      <div className="relative flex items-center justify-start w-full max-w-[340px] h-[50px] pl-4">
        <label
          className={`
            absolute left-6 text-[16px] text-gray-400 transition-all duration-300
            spacing-[2px] w-auto p-1 bg-bg-primary rounded-[6px]

            ${
              hasValue
                ? "top-0 text-[12px] text-text-primary left-[25px]"
                : "top-1/2 -translate-y-1/2"
            }
          `}
        >
          {label}
        </label>

        <input
          placeholder=" "
          value={value}
          readOnly
          className="
            peer w-full h-full bg-transparent cursor-pointer z-20 
            rounded-[50px] font-sans font-small focus:outline-none
          "
        />

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
  )
})

RoundedDataSelector.displayName = "RoundedDataSelector"
