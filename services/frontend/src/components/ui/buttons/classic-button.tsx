import { forwardRef } from "react"

interface ClassicButtonProps {
  text?: string
  className?: string
  onClick?: () => void
}

const ClassicButton = forwardRef<HTMLButtonElement, ClassicButtonProps>(
  (
    {
      text = "Continue",
      className = "",
      onClick = () => { }
    },
    ref
  ) => {
    return (
      <div className="flex justify-center bg-transparent border-none">
        <button
          onClick={onClick}
          ref={ref}
          className={`btn-text-color btn-bg-color
            border-none cursor-pointer font-sans
            pointer-events-auto touch-auto w-[140px] h-[40px] rounded-[50px] font-medium text-[16px]
            hover:bg-btn-hover
            active:duration-50 hover:bg-btn-hover active:bg-btn-active
            transition-all duration-300 linear ${className}`}
        >
          {text}
        </button>
      </div>
    )
  }
)

ClassicButton.displayName = "ClassicButton"

export default ClassicButton
