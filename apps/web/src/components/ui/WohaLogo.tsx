"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";

export function WohaLogo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Image
        src="/logos/black_triangle.png"
        alt=""
        width={28}
        height={28}
      />
    );
  }

  return (
    <Image
      src={
        resolvedTheme === "dark"
          ? "/logos/white_triangle.png"
          : "/logos/black_triangle.png"
      }
      alt=""
      width={28}
      height={28}
    />
  );
}