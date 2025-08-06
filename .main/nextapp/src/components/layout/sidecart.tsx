"use client";

import { useTheme } from "@providers/ThemeProvider";
import Image from "next/image";

export default function SideBar() {
  const { theme } = useTheme();
  const darkTheme = theme === "dark";

  const sidebarItems = [
    { icon: "", label: "New Chat" },
    { icon: "", label: "Search Chat" },
  ];

  return (
    <div className={`w-full h-full z-[100] border-r border-solid border-gray-dark ${darkTheme ? "bg-dark-black-secondary" : "bg-light-white-secondary"}`}>
      <div className="w-full h-full flex flex-col p-4 gap-6">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <Image
            src={`/logos/${darkTheme ? "logo-white" : "logo-black"}.png`}
            alt="Woah AI"
            width={24}
            height={24}
          />
          <span className={`text-lg font-semibold ${darkTheme ? "text-white" : "text-black"}`}>
            WoahGPT
          </span>
        </div>

        {/* Sidebar Options */}
        <div className="flex flex-col gap-4">
          {sidebarItems.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-opacity-10 ${
                darkTheme ? "text-white hover:bg-white" : "text-black hover:bg-black"
              }`}
            >
              {/* Replace with real icon if needed */}
              <span className="w-4 h-4 rounded-full bg-gray-400"></span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
