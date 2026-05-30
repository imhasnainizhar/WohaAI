import { forwardRef } from "react"
import clsx from "clsx"

interface ArrowButtonProps {
  onClick?: () => void
  open?: boolean
  size?: number
  className?: string
}

export const LeftArrowButton = forwardRef<HTMLButtonElement, ArrowButtonProps>(
  (
    {
      onClick,
      open = true,
      size = 25,
      className,
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        type="button"
        className={clsx(
          "text-text transition hover:bg-bg-btn-hover rounded-full cursor-pointer flex items-center justify-center focus:outline-none",
          className
        )}
        style={{
          width: size,
          height: size,
        }}
      >
        <i
          className={clsx(
            "bx text-xl transition-transform",
            open ? "bx-chevron-left" : "bx-chevron-right"
          )}
        />
      </button>
    )
  }
)

LeftArrowButton.displayName = "LeftArrowButton"
