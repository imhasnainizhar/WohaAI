import { forwardRef } from "react"
import { Alert, AlertTitle } from "@lib/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"

interface DataSelectorProps {
  value: string
  label: string
  error?: any
  theme?: string
  className?: string
  cacheBeingUsed?: boolean

  // add this
  active?: boolean
}

export const RoundedDataSelector = forwardRef<
  HTMLDivElement,
  DataSelectorProps & React.HTMLAttributes<HTMLDivElement>
>(({ value, label, error, theme, className, active = false, cacheBeingUsed = false, ...rest }, ref) => {

  const hasValue = !!value
  const float = hasValue || active   // 👈 key logic

  return (
    <div
      ref={ref}
      {...rest}
      className={`
        w-full max-w-[340px] h-[50px] rounded-[50px]
        flex items-center justify-center
        border border-border-secondary
        text-text
        ${error ? "border-[rgb(255,53,53)]" : ""}
        ${className || ""}
      `}
      data-theme={theme}
      data-cache-being-used={cacheBeingUsed}
    >
      <div className="relative flex items-center justify-start w-full h-[50px] pl-4">

        <input
          readOnly
          id="date"
          value={value}
          placeholder=" "
          className="
            peer w-full h-full bg-transparent cursor-pointer z-20 
            rounded-[50px] font-sans focus:outline-none
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
            bg-bg-primary rounded-[6px] w-10
            text-center
          `}
        >
          {label}
        </label>

        {error && (
          <Alert
            variant="destructive"
            className="absolute top-[40px] left-1 bg-transparent border-none w-[150px] h-[25px] text-[13px]"
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
