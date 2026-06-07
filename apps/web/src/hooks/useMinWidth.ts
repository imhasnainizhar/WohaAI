"use client";

import { useEffect, useState } from "react";

export function useMinWidth(breakpoint: number = 980) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(`(min-width: ${breakpoint}px)`);

    // Set initial value
    setMatches(media.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener("change", handler);

    return () => {
      media.removeEventListener("change", handler);
    };
  }, [breakpoint]);

  return matches;
}