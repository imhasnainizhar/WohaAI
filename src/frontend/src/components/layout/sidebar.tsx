"use client";

import MoreBar from "@components/layout/morebar";
import { useAppContext } from "@providers/AppContext";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "@providers/ThemeProvider";
import Image from "next/image";

export default function SideBar() {
  const { theme } = useTheme();
  const darkTheme = theme === "dark";

  const { toggleSearch, moreBarVisible, toggleMoreBar, setMoreBarVisible } =
    useAppContext();
  const moreBarRef = useRef<HTMLDivElement | null>(null);
  const moreBarToggleBtnRef = useRef<HTMLDivElement | null>(null);
  const [moreBarLeft, setMoreBarLeft] = useState<number | null>(null);

  const updateMoreBarPosition = () => {
    if (moreBarToggleBtnRef.current) {
      const rect = moreBarToggleBtnRef.current.getBoundingClientRect();
      const distanceFromRight = window.innerWidth - rect.left - 100;
      setMoreBarLeft(distanceFromRight);
    }
  };

  useEffect(() => {
    if (moreBarVisible) updateMoreBarPosition();
  }, [moreBarVisible]);

  useEffect(() => {
    const closeIfOutside = (e: MouseEvent) => {
      if (
        moreBarVisible &&
        moreBarRef.current &&
        !moreBarRef.current.contains(e.target as Node) &&
        !moreBarToggleBtnRef.current?.contains(e.target as Node)
      ) {
        setMoreBarVisible(false);
      }
    };
    window.addEventListener("click", closeIfOutside);
    return () => window.removeEventListener("click", closeIfOutside);
  }, [moreBarVisible]);

  const sidebarItems = [
    {
      label: "New Chat",
      icon: (
        <i
          className="bx bx-edit"
          style={{ fontSize: "24px", color: darkTheme ? "#fff" : "#000" }}
        />
      ),
      onClick: null,
    },
    {
      label: "Search Chat",
      icon: (
        <i
          className="bx bx-search"
          style={{ fontSize: "24px", color: darkTheme ? "#fff" : "#000" }}
        />
      ),
      onClick: toggleSearch,
    },
  ];

  return (
    <div
      className={`relative w-full h-full z-[100] ${
        darkTheme ? "bg-dark-black-secondary" : "bg-light-white-secondary"
      }`}
    >
      {/* Sidebar layout: header + main section */}
      <div className="w-full h-full flex flex-col">
        {/* Logo Section */}
        <div className="p-4">
          <Image
            src={`/logos/${darkTheme ? "logo-white" : "logo-black"}.png`}
            alt="Woah AI"
            width={24}
            height={24}
          />
        </div>

        {/* Main content: top menu + bottom profile */}
        <div className="flex flex-col justify-between flex-1 px-4 py-6">
          {/* Top menu */}
          <div className="flex flex-col gap-4">
            {sidebarItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 cursor-pointer ${
                  darkTheme ? "text-white" : "text-black"
                }`}
                onClick={item.onClick || undefined}
              >
                {item.icon}
                <span className="text-sm font-medium truncate">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom profile / account button */}
          <div
            className={`flex items-center gap-3 cursor-pointer ${
              darkTheme ? "text-white" : "text-black"
            }`}
            ref={moreBarToggleBtnRef}
            onClick={toggleMoreBar}
          >
            <i
              className="bx bx-user"
              style={{ fontSize: "24px", color: darkTheme ? "#fff" : "#000" }}
            />
            <span className="text-sm font-medium truncate">My Profile</span>
          </div>
        </div>
      </div>

      {/* MoreBar popup */}
      {moreBarVisible && moreBarLeft !== null && (
        <div
          className="more-options-box morebar-visible"
          ref={moreBarRef}
          style={{
            top: "60px",
            right: moreBarLeft <= 0 ? "40px" : `${moreBarLeft}px`,
          }}
        >
          <MoreBar onClickToggle={() => setMoreBarVisible(false)} />
        </div>
      )}
    </div>
  );
}
