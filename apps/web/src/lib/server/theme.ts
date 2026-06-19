"use server";
import { cookies } from "next/headers";

// Theme cookie name
export const THEME_COOKIE_NAME = "theme";

// Theme values
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
} as const;

// Theme type
export type Theme = (typeof THEMES)[keyof typeof THEMES];

/**
 * 
 * @returns Theme from cookie or default to dark
 * For Server-side rendered components
 */
export async function getTheme(): Promise<Theme> {
  const cookieStore = await cookies();

  const theme = cookieStore.get(THEME_COOKIE_NAME)?.value;

  return theme === THEMES.LIGHT
    ? THEMES.LIGHT
    : THEMES.DARK;
}

export async function isDarkTheme(): Promise<boolean> {
  return (await getTheme()) === THEMES.DARK;
}