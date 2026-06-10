"use client"

import { useTheme } from "next-themes"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  IconCheck,
  IconMoon,
  IconSun,
  IconDeviceDesktop,
} from "@tabler/icons-react"

export default function ThemePopover({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  const themes = [
    {
      value: "light",
      label: "Light",
      icon: IconSun,
    },
    {
      value: "dark",
      label: "Dark",
      icon: IconMoon,
    },
    {
      value: "system",
      label: "System",
      icon: IconDeviceDesktop,
    },
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`
            w-full
            text-left
            px-2
            py-2
            cursor-pointer
            hover:bg-accent
            font-small
            text-fluid-sm
            flex items-center justify-between
            ${className}
          `}
        >
          <span>Theme</span> <span className={`font-small text-fluid-sm text-muted-foreground capitalize`}>{theme}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="left"
        sideOffset={-50}
        className="w-40 p-1 z-51"
      >
        <div className="flex flex-col gap-1">
          {themes.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.value}
                onClick={() => setTheme(item.value)}
                className="
                  flex
                  items-center
                  justify-between
                  rounded-md
                  px-2
                  py-2
                  text-sm
                  hover:bg-accent
                "
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </div>

                {theme === item.value && (
                  <IconCheck className="size-4" />
                )}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}