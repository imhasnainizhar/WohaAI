"use client";

import { useEffect, useRef } from "react";
import TransitionalLink from "@utils/TransitionalLink";
import "@styles/components/layouts/morebar.style.css";
import { useAuth } from "@providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useTheme } from "@providers/ThemeProvider";

type Props = {
  onClickToggle: () => void;
};

export default function MoreBar({ onClickToggle }: Props) {
  const { userInfo, setUser } = useAuth();
  const router = useRouter();
  const { darkTheme, toggleTheme } = useTheme();
  const moreBarRef = useRef<HTMLDivElement>(null);

  // 🟡 Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreBarRef.current &&
        !moreBarRef.current.contains(event.target as Node)
      ) {
        onClickToggle(); // 🔁 close menu
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClickToggle]);

  // ✅ Signout + close bar
  const signoutCall = async () => {
    try {
      const res = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });

      const result = await res.json();
      if (result.ok) {
        setUser(null);
        onClickToggle(); // ❗ Close MoreBar
        setTimeout(() => {
          router.push("/");
        }, 0);
      } else {
        console.error("❌ Logout failed", result);
      }
    } catch (error) {
      console.error("❌ Error during logout", error);
    }
  };

  return (
    <div className="morebar-b">
      <div ref={moreBarRef} className="morebar-options-content">
        {userInfo ? (
          <div
            className={`morebar-options ${
              darkTheme
                ? "dark-bg-secondary dark-text-primary"
                : "light-bg-secondary light-text-primary"
            }`}
          >
            <a onClick={signoutCall}>SignOut</a>
            <TransitionalLink href="/me" onClick={onClickToggle}>
              My Profile
            </TransitionalLink>
            <p onClick={toggleTheme}>
              {darkTheme ? "Light Mode" : "Dark Mode"}
            </p>
          </div>
        ) : (
          <div
            className={`morebar-options ${
              darkTheme
                ? "dark-bg-secondary dark-text-primary"
                : "light-bg-secondary light-text-primary"
            }`}
          >
            <TransitionalLink href="/auth/signin" onClick={onClickToggle}>
              SignIn
            </TransitionalLink>
            <TransitionalLink href="/auth/signup" onClick={onClickToggle}>
              SignUp
            </TransitionalLink>
            <p onClick={toggleTheme}>
              {darkTheme ? "Switch Light Mode" : "Switch Dark Mode"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
