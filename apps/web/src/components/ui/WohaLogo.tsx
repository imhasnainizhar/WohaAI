"use client";

import Image from "next/image";
import { useTheme } from "@/providers/ThemeProvider";
import { useEffect, useState } from "react";

export function WohaLogo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: 28, height: 28 }} />; // placeholder
  }

  const dark = resolvedTheme === "dark";

  return (
    <Image
      src={dark ? "/logos/white_triangle.png" : "/logos/black_triangle.png"}
      alt="logo"
      width={28}
      height={28}
    />
  );
}