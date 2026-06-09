"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

export default function FloatingInput({
  id,
  label,
  type = "text",
}: {
  id: string
  label: string
  type?: string
}) {
  const [value, setValue] = useState("")

  return (
    <div className="relative">
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder=" "
        className="peer h-10 bg-background!"
      />

      <label
        htmlFor={id}
        className={`
          absolute left-3 px-1 bg-background
          transition-all duration-200 pointer-events-none
          
          ${
            value
              ? "-top-2 text-xs"
              : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
          }

          peer-focus:-top-2
          peer-focus:translate-y-0
          peer-focus:text-xs
          peer-focus:text-foreground
        `}
      >
        {label}
      </label>
    </div>
  )
}