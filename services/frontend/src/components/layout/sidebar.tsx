"use client";

import MainMenu from "@components/layout/main-menu";
import { useAppContext } from "@providers/app";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "@providers/theme";
import Image from "next/image";
import UsernameCollapsablePlate from "@components/ui/cards/username-collapsable-plate"
import { LuSquareLibrary } from "react-icons/lu";
import { LuImage } from "react-icons/lu";
import { MdHistoryEdu } from "react-icons/md";
import { IoCreate } from "react-icons/io5";
import { LuSearch } from "react-icons/lu";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function Sidebar() {
  const { theme } = useTheme();
  const darkTheme = theme === "dark";

  const router = useRouter();

  const {
    toggleSearch,
    toggleMainMenu,
    mainMenuVisible,
    setMainMenuVisible,
    sidebarExpanded,
    toggleSidebar,
  } = useAppContext();

  const ANIMATION_TIMER = 500
  const [animationDone, setAnimationDone] = useState<Boolean>(true);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const mainMenuRef = useRef<HTMLDivElement | null>(null);
  const mainMenuToggleBtnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setAnimationDone(false);

    const animationTimer = setTimeout(() => {
      setAnimationDone(true)
    }, ANIMATION_TIMER);

    return () => clearTimeout(animationTimer);

  }, [sidebarExpanded]
  )

  // Sidebar empty-area click (ONLY when collapsed)
  const handleSidebarClick = (e: React.MouseEvent) => {
    if (sidebarExpanded) return;

    const target = e.target as HTMLElement;

    // Anything interactive should NOT toggle sidebar
    if (
      target.closest(
        "button, a, i, input, [data-no-sidebar-toggle]"
      )
    ) {
      return;
    }

    toggleSidebar();
  };


  // Close Main Menu on outside click
  useEffect(() => {
    const closeIfOutside = (e: MouseEvent) => {
      if (
        mainMenuVisible &&
        mainMenuRef.current &&
        !mainMenuRef.current.contains(e.target as Node) &&
        !mainMenuToggleBtnRef.current?.contains(e.target as Node)
      ) {
        setMainMenuVisible(false);
      }
    };
    window.addEventListener("click", closeIfOutside);
    return () => window.removeEventListener("click", closeIfOutside);
  }, [mainMenuVisible]);

  const sidebarItems = [
    {
      label: "New Chat",
      icon: <IoCreate className="min-w-5 min-h-5" />,
      onClick: undefined,
      link: "/"
    },
    {
      label: "Search Chat",
      icon: <LuSearch className="min-w-5 min-h-5" />,
      onClick: toggleSearch,
    },
    {
      label: "Library",
      icon: <LuSquareLibrary className="min-w-5 min-h-5" />,
      onClick: toggleSearch,
    },
    {
      label: "Images",
      icon: <LuImage className="min-w-5 min-h-5" />,
      onClick: toggleSearch,
    },
    {
      label: "Chat History",
      icon: <MdHistoryEdu className="min-w-5 min-h-5" />,
      onClick: toggleSearch,
    },
  ];

  return (
    <div
      ref={sidebarRef}
      data-sidebar-root
      onClick={handleSidebarClick}
      className={`
        relative h-full bg-bg-secondary flex flex-col
        transition-width duration-450 ease-in-out pt-2 select-none
        ${sidebarExpanded ? "w-[245px]" : "cursor-w-resize w-[60px]"}
      `}
    >
      {/* Logo + Collapse Button */}
      <div className="p-4 flex items-center justify-between">
        <Image
          src={`/logos/${darkTheme ? "white_triangle" : "black_triangle"}.png`}
          alt="Woah AI"
          width={30}
          height={30}
        />
        {sidebarExpanded && (
          <div className="text-text transition hover:bg-bg-btn-hover rounded-full cursor-pointer w-[25px] h-[25px] ">
            <button
              onClick={toggleSidebar}
              className="cursor-pointer w-[25px] h-[25px] flex items-center justify-center"
            >
              <i className="bx bx-chevron-left text-xl" />
            </button>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="flex-1 flex flex-col justify-between px-2 py-4">
        <div className="flex flex-col justify-start h-auto">
          {sidebarItems.map((item, idx) => (
            (item.link && item.link.length > 0) ? (
              <Link
                href={item.link}
                key={idx}
                className={`flex items-center px-2 w-auto h-auto rounded-[10px] truncate 
                cursor-pointer text-text overflow-hidden hover:bg-bg-btn-hover transition-all duration-[inherit]
                ease-in-out justify-start`}
                onClick={() => item.onClick}
              >

                <div className="flex items-center justify-center w-9 h-9">
                  {item.icon}
                </div>
                <div
                  className={`
    whitespace-nowrap overflow-hidden
    transition-all duration-[inherit] ease-in-out
    text-sm font-medium text-left
    ${sidebarExpanded
                      ? "opacity-100 w-40 ml-3"
                      : "opacity-0 w-0 ml-0"}
  `}
                >
                  {item.label}
                </div>
              </Link>
            ) : (
              <button
                key={idx}
                className={`flex items-center px-2 w-auto h-auto rounded-[10px] truncate 
                cursor-pointer text-text overflow-hidden hover:bg-bg-btn-hover transition-all duration-[inherit]
                ease-in-out justify-start`}
                onClick={() => item.onClick}
              >

                <div className="flex items-center justify-center w-9 h-9">
                  {item.icon}
                </div>
                <div
                  className={`
                      whitespace-nowrap overflow-hidden
                      transition-all duration-[inherit] ease-in-out
                      text-sm font-medium text-left
                      ${sidebarExpanded
                      ? "opacity-100 w-40 ml-3"
                      : "opacity-0 w-0 ml-0"}
                    `}
                >
                  {item.label}
                </div>

              </button>
            )))}
        </div>

        {/* Profile */}
        <div
          ref={mainMenuToggleBtnRef}
          onClick={(e) => {
            e.stopPropagation();
            toggleMainMenu();
          }}
          className="flex items-center w-[250px] cursor-pointer text-text"
        >
          <UsernameCollapsablePlate />
        </div>
      </div>
    </div>
  );
}
