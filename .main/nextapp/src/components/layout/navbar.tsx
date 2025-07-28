"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import "@styles/components/layouts/nav.style.css";
import "boxicons/css/boxicons.min.css";
import Image from "next/image";
import MoreBar from "@components/layout/morebar";
import { useTheme } from "@providers/ThemeProvider";
import clsx from "clsx";

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
  const [showMoreBar, setShowMoreBar] = useState(false);
  const hasMounted = useHasMounted();

  const updateMoreBarPosition = () => {
    if (moreBarToggleBtnRef.current) {
      const rect = moreBarToggleBtnRef.current.getBoundingClientRect();
      const distanceFromRight = window.innerWidth - rect.left - 100;
      console.log(distanceFromRight);
      setMoreBarLeft(distanceFromRight);
    }
  };

  const toggleSearch = () => {
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
  };

  const toggleMoreBar = () => {
    if (showMoreBar) {
      setShowMoreBar(false);
      return;
    }

    updateMoreBarPosition();
    requestAnimationFrame(() => {
      setShowMoreBar(true);
    });
  };

  const closeMoreBar = () => {
    setShowMoreBar(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (searchInputRef.current?.classList.contains("search-input-appear")) {
        toggleSearch();
      }

      if (showMoreBar) updateMoreBarPosition();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", updateMoreBarPosition);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updateMoreBarPosition);
    };
  }, [showMoreBar]);

  useEffect(() => {
    const closeMoreBarIfClickedOutside = (e: MouseEvent) => {
      if (
        showMoreBar &&
        moreBarRef.current &&
        !moreBarRef.current.contains(e.target as Node) &&
        !moreBarToggleBtnRef.current?.contains(e.target as Node)
      ) {
        closeMoreBar();
      }
    };

    window.addEventListener("click", closeMoreBarIfClickedOutside);
    return () =>
      window.removeEventListener("click", closeMoreBarIfClickedOutside);
  }, [showMoreBar]);

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
          onClick={toggleSearch}
        >
          X
        </p>
      </div>

      <div className="nav-items">
        <Link className="brand-logo" title="Barlon" href={"/"}>
          {darkTheme ? (
            <>
              <Image
                src={"/logos/White_triangle.png"}
                alt="Brand Logo"
                width={30}
                height={30}
              />
            </>
          ) : (
            <>
              <Image
                src={"/logos/Black_triangle.png"}
                alt="Brand Logo"
                width={40}
                height={40}
              />
            </>
          )}
          <div
            className={`brand-logo-text ${
              darkTheme ? "dark-text-primary" : "light-text-primary"
            }`}
          >
            Woah
          </div>
        </Link>

        <div className="nav-right-side">
          <div className="nav-icons" title="Search" onClick={toggleSearch}>
            <i
              className="bx bx-search"
              style={{ fontSize: "24px", color: darkTheme ? "#fff" : "#000" }}
            ></i>
          </div>
          <div
            className="nav-icons"
            title="More"
            ref={moreBarToggleBtnRef}
            onClick={toggleMoreBar}
          >
            <i
              className="bx bx-user"
              style={{ fontSize: "24px", color: darkTheme ? "#fff" : "#000" }}
            ></i>
          </div>
          <div className="nav-icons" title="Cart">
            <i
              className="bx bx-menu"
              style={{ fontSize: "24px", color: darkTheme ? "#fff" : "#000" }}
            ></i>
          </div>
        </div>

        {hasMounted && showMoreBar && moreBarLeft !== null && (
          <div
            className="more-options-box morebar-visible"
            ref={moreBarRef}
            style={{
              top: "60px",
              right: moreBarLeft <= 0 ? "40px" : `${moreBarLeft}px`,
            }}
          >
            <MoreBar onClickToggle={closeMoreBar} />
          </div>
        )}
      </div>
    </nav>
  );
}
