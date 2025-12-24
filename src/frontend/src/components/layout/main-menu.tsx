"use client";

import { useEffect, useRef } from "react";
import TransitionalLink from "@utils/TransitionalLink";
import "@styles/components/layouts/morebar.style.css";
import { useTheme } from "@providers/ThemeProvider";
import { useAppContext } from "@providers/AppContext";
import UsernamePlate from "@components/ui/cards/username-plate";

type Props = {
  onClickToggle: () => void;
  position: {
    zIndex: number;
    width: string;
    height: string;
    top: string;
    left: string;
    right: string;
    bottom: string;
  };
};

export default function MainMenu({ onClickToggle, position }: Props) {
  const { darkTheme, toggleTheme } = useTheme();
  const mainMenuRef = useRef<HTMLDivElement>(null);
  const { toggleSettings, setSignin } = useAppContext();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mainMenuRef.current && !mainMenuRef.current.contains(event.target as Node)) {
        onClickToggle();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClickToggle]);

  const userInfo = null; // Replace with actual user info when available

  const stopClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="fixed border border-solid border-primary rounded-[18px] bg-bg-tertiary w-full h-auto"
      style={position}
      onClick={stopClick} // Stop all clicks from bubbling outside
    >
      <div ref={mainMenuRef} className="h-auto w-auto p-2">
        {userInfo ? (
          <div className="flex flex-col items-start justify-center gap-1 text-text rounded-[25px] text-[15px] font-montserrat-sans h-auto">
            {/* Username plate */}
            <div
              className="flex items-center justify-center border-b border-solid border-secondary w-full h-auto"
              onClick={stopClick}
            >
              <UsernamePlate />
            </div>

            {/* SignOut */}
            <div
              className="cursor-pointer w-full h-[40px] flex items-center justify-start px-2 py-1 hover:bg-bg-hover transition-all duration-300 ease-in-out rounded-[13px]"
              onClick={(e) => {
                e.stopPropagation();
                // signOut logic here
              }}
            >
              <p>SignOut</p>
            </div>

            {/* Settings */}
            <div
              className="cursor-pointer w-full h-[40px] flex items-center justify-start px-2 py-1 hover:bg-bg-hover transition-all duration-300 ease-in-out rounded-[13px]"
              onClick={(e) => {
                e.stopPropagation();
                toggleSettings();
              }}
            >
              <p>Settings</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start justify-center gap-1 text-text rounded-[25px] text-[15px] font-montserrat-sans h-auto">
            {/* Username plate */}
            <div
              className="border-b border-solid border-primary w-full h-full flex items-center justify-center"
              onClick={stopClick}
            >
              <div className="flex items-center justify-center mb-2 w-[197px] h-[50px]">
                <UsernamePlate />
              </div>
            </div>

            {/* SignIn */}
            <div
            onClick={() => setSignin(true)}
              className="w-full h-[40px] flex items-center justify-start px-2 py-1 hover:bg-hover cursor-pointer transition-all duration-300 ease-in-out rounded-[13px]"
            >
              <div>
                SignIn
              </div>
            </div>

            {/* SignUp */}
            <div
              onClick={() => setSignin(true)}
              className="w-full h-[40px] flex items-center justify-start px-2 py-1 hover: transition-all duration-300 ease-in-out rounded-[13px]"
            >
              <div>
                SignUp
              </div>
            </div>

            {/* Dark/Light toggle */}
            <button
              className="cursor-pointer w-full h-[40px] flex items-center justify-start px-2 py-1 hover:bg-bg-hover transition-all duration-300 ease-in-out rounded-[13px]"
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
            >
              <p>{darkTheme ? "Switch Light Mode" : "Switch Dark Mode"}</p>
            </button>

            {/* Settings */}
            <button
              className="cursor-pointer w-full h-[40px] flex items-center justify-start px-2 py-1 hover:bg-bg-hover transition-all duration-300 ease-in-out rounded-[13px]"
              onClick={(e) => {
                e.stopPropagation();
                toggleSettings();
              }}
            >
              <p className="pointer-none">Settings</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
