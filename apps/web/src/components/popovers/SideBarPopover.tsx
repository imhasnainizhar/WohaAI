"use client";

import Link from "next/link";
import UsernamePlate from "@/components/ui/cards/UsernamePlate";
import { useAppContext } from "@/providers/AppProvider";
import { toggleTheme, isDarkTheme } from "@/providers/ThemeProvider";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Will be updated to exact type
type Props = {
  userInfo?: unknown;
};

export default function SideBarPopover({ userInfo }: Props) {
  const { toggleSettings } = useAppContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-full rounded-xl outline-none"
          aria-label="Open account menu"
        >
          <UsernamePlate />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="start"
        className="w-64"
      >
        {userInfo ? (
          <>
            <div className="px-2 py-2">
              <UsernamePlate />
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              Sign Out
            </DropdownMenuItem>

            <DropdownMenuItem onClick={toggleSettings}>
              Settings
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <div className="px-2 py-2">
              <UsernamePlate />
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/signin">
                Sign In
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/signup">
                Sign Up
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={toggleTheme}>
              {isDarkTheme()
                ? "Switch Light Mode"
                : "Switch Dark Mode"}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={toggleSettings}>
              Settings
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}