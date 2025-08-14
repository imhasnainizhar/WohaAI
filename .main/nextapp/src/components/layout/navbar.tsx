"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import "@styles/components/layouts/nav.style.css";
import "boxicons/css/boxicons.min.css";
import Image from "next/image";
import MoreBar from "@components/layout/morebar";
import { useTheme } from "@providers/ThemeProvider";
import clsx from "clsx";
import { useAppContext } from "@providers/AppContext";

function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  return hasMounted;
}

export default function Navbar() {
  const navRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLDivElement | null>(null);
  const searchInputFieldRef = useRef<HTMLInputElement | null>(null);
  const searchCancelBtnRef = useRef<HTMLParagraphElement | null>(null);
  const moreBarRef = useRef<HTMLDivElement | null>(null);
  const moreBarToggleBtnRef = useRef<HTMLDivElement | null>(null);
  const searchActiveRef = useRef<boolean>(false);

  const { theme } = useTheme();
  const darkTheme = theme === "dark";

  const [moreBarLeft, setMoreBarLeft] = useState<number | null>(null);
  const hasMounted = useHasMounted();

  const {
    toggleSidebar,
    searchActive,
    toggleSearch,
    moreBarVisible,
    toggleMoreBar,
    setMoreBarVisible
  } = useAppContext();

  const updateMoreBarPosition = () => {
    if (moreBarToggleBtnRef.current) {
      const rect = moreBarToggleBtnRef.current.getBoundingClientRect();
      const distanceFromRight = window.innerWidth - rect.left - 100;
      setMoreBarLeft(distanceFromRight);
    }
  };

  const handleToggleSearch = () => {
    const isNowActive = searchInputRef.current?.classList.toggle(
      "search-input-appear"
    );
    searchInputFieldRef.current?.classList.toggle("search-input-field-active");
    searchCancelBtnRef.current?.classList.toggle("enable-search-cancel-btn");

    searchActiveRef.current = !!isNowActive;

    if (navRef.current) {
      navRef.current.classList.remove(
        "nav-onscroll",
        "dark-bg-secondary",
        "light-bg-primary"
      );

      if (isNowActive || window.scrollY > 30) {
        navRef.current.classList.add("nav-onscroll");
        navRef.current.classList.add(
          darkTheme ? "dark-bg-secondary" : "light-bg-primary"
        );
      }
    }

    document.body.style.overflow = isNowActive ? "hidden" : "";
    toggleSearch();
  };

  // Trigger search UI open when searchActive changes from context
  useEffect(() => {
    if (searchActive) {
      handleToggleSearch();
    }
  }, [searchActive]);

  const handleToggleMoreBar = () => {
    if (moreBarVisible) {
      setMoreBarVisible(false);
      return;
    }
    updateMoreBarPosition();
    requestAnimationFrame(() => {
      setMoreBarVisible(true);
    });
    toggleMoreBar();
  };

  useEffect(() => {
    const handleResize = () => {
      if (searchInputRef.current?.classList.contains("search-input-appear")) {
        handleToggleSearch();
      }
      if (moreBarVisible) updateMoreBarPosition();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", updateMoreBarPosition);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updateMoreBarPosition);
    };
  }, [moreBarVisible]);

  useEffect(() => {
    const closeMoreBarIfClickedOutside = (e: MouseEvent) => {
      if (
        moreBarVisible &&
        moreBarRef.current &&
        !moreBarRef.current.contains(e.target as Node) &&
        !moreBarToggleBtnRef.current?.contains(e.target as Node)
      ) {
        setMoreBarVisible(false);
      }
    };

    window.addEventListener("click", closeMoreBarIfClickedOutside);
    return () =>
      window.removeEventListener("click", closeMoreBarIfClickedOutside);
  }, [moreBarVisible]);

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current || searchActiveRef.current) return;

      const nav = navRef.current;
      const scrolled = window.scrollY > 30;

      nav.classList.remove(
        "nav-onscroll",
        "dark-bg-secondary",
        "light-bg-primary"
      );

      if (scrolled) {
        nav.classList.add("nav-onscroll");
        nav.classList.add(darkTheme ? "dark-bg-secondary" : "light-bg-primary");
      }
    };

    handleScroll(); // Run once on mount
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [theme]);

  return (
    <nav className="nav" ref={navRef}>
      {/* Search input overlay */}
      <div
        className={clsx(
          "search-input",
          darkTheme
            ? "dark-bg-secondary light-shadow"
            : "light-bg-primary dark-shadow"
        )}
        ref={searchInputRef}
      >
        <input
          className="search-input-field"
          ref={searchInputFieldRef}
          placeholder="Search Here..."
        />
        <p
          className="search-cancle-btn"
          ref={searchCancelBtnRef}
          onClick={handleToggleSearch}
        >
          X
        </p>
      </div>

      {/* Navbar content */}
      <div className="nav-items">
        <Link className="brand-logo" title="Barlon" href={"/"}>
          <div
            className={`text-lg font-semibold ${
              darkTheme ? "text-white" : "text-black"
            }`}
          >
            WoahGPT
          </div>
        </Link>
        <div className="nav-right-side">
          {/* Sidebar toggle button */}
          <div className="nav-icons" title="SideBar" onClick={toggleSidebar}>
            <i
              className="bx bx-menu"
              style={{ fontSize: "24px", color: darkTheme ? "#fff" : "#000" }}
            ></i>
          </div>
        </div>
      </div>
    </nav>
  );
}
