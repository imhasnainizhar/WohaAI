"use client";

import { logger } from "@utils/logger";
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

  // Initialize from cookie
  useEffect(() => {
    const cookieTheme = (getCookie("theme") as Theme) || "dark";
    setTheme(cookieTheme);
  }, []);

  logger.debug("Theme Cookie value: " + theme);
  console.log("Theme Cookie value: " + theme);

  // Update html class and cookie when theme changes
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  logger.debug("ThemeProvider initialized with theme: " + theme);
  console.log("ThemeProvider initialized with theme: " + theme);

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
