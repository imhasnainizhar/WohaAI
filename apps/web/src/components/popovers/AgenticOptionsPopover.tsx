"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { AGENT_STYLES } from "@/lib/constants/agent-styles"
import { useAgentOptions } from "@/providers/AgentOptionsProvider"

export default function AgenticOptionsPopover() {
  const {
    webSearchEnabled,
    setWebSearchEnabled,
    styleSelected,
    setStyleSelected,
  } = useAgentOptions()

  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`cursor-pointer transition-all duration-300 ease-in-out hover:bg-black  
            ${ open ? "bg-black" : "" }`}
        >
          <span className="text-muted-foreground font-semibold text-fluid-xl leading-none">+</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-56 rounded-dropdown!"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
          >
            <label className={`flex items-center justify-between w-full cursor-pointer`}>
            <span>Web Search</span>

            <Switch
              checked={webSearchEnabled}
              onCheckedChange={setWebSearchEnabled}
            />
            </label>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className={`cursor-pointer flex items-center justify-between w-full`}>
              <span>Style</span>
              <span className={`text-muted-foreground text-fluid-sm capitalize`}>{styleSelected}</span>
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent className="w-48">
              {AGENT_STYLES.map((style) => (
                <DropdownMenuItem
                  key={style}
                  onClick={() => setStyleSelected(style)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span className="capitalize">
                    {style}
                  </span>

                  {styleSelected === style && (
                    <span>✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}