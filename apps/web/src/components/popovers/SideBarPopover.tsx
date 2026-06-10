"use client";

import Link from "next/link";
import UsernamePlate from "@/components/ui/cards/UsernamePlate";
import { useAppContext } from "@/providers/AppProvider";
import { useThemeUtils } from "@/providers/ThemeProvider";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ThemePopover from "./ThemePopover";

// We will remove this unknown later
type Props = {
  user?: unknown;
  className?: string;
};

export default function SideBarPopover({ user, className }: Props) {
  const { toggleSettings } = useAppContext();
  const { toggleTheme, isDarkTheme } = useThemeUtils();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`w-full rounded-xl outline-none ${className}`}
          aria-label="Open account menu"
        >
          <UsernamePlate />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        className={
          `max-w-50 p-1 z-51`
        }
      >
        <>
          <div className={
            `px-2 py-2 cursor-pointer`
          }>
            <UsernamePlate />
          </div>

          <div className={
            `h-px bg-border`
          } />
          <div className={`text-fluid-sm font-small my-1.5`}>
          <ThemePopover className={`rounded-md hover:bg-accent hover:text-accent-foreground`} />
          <button className={
            `w-full text-left px-2 py-2 cursor-pointer rounded-md hover:bg-accent hover:text-accent-foreground`
          }>
            Sign Out
          </button>

          <button
            onClick={toggleSettings}
            className={
              `w-full text-left px-2 py-2 cursor-pointer rounded-md hover:bg-accent hover:text-accent-foreground`
            }
          >
            Settings
          </button>

          </div>
        </>
      </PopoverContent>
    </Popover>
  );
}