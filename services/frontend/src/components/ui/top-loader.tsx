// components/TopLoader.tsx
"use client";

import { useEffect, useState } from "react";

export default function TopLoader() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Simulate loading for demo
    let interval = setInterval(() => {
      setWidth((w) => (w < 90 ? w + Math.random() * 10 : w));
    }, 300);

    // Finish loading after 2s
    setTimeout(() => {
      clearInterval(interval);
      setWidth(100);
      setTimeout(() => setWidth(0), 300);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{ width: `${width}%` }}
      className="fixed top-0 left-0 h-[3px] bg-pink-600 z-[9999] transition-all duration-300"
    />
  );
}
