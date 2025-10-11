"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  darkTheme: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  darkTheme: true,
  toggleTheme: () => {},
});

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const cookieTheme = (getCookie("theme") as Theme) || "dark";
    setTheme(cookieTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme: Theme = theme === "dark" ? "light" : "dark";
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000`;

    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        window.location.reload();
      });
    } else {
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  useEffect(() => {
    console.log("Client theme cookie value:", getCookie("theme"));
console.log("Provider theme state:", theme);

  }, [])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        darkTheme: theme === "dark",
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
