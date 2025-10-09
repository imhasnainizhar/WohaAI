"use client";
import { useTheme } from "@providers/ThemeProvider";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function TextArea() {
  const textArea = useRef<HTMLTextAreaElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();
  const darkTheme = theme === "dark";

  const [height, setHeight] = useState(40);

  useEffect(() => {
    const ta = textArea.current;
    const parent = container.current;
    if (!ta || !parent) return;

    const lineHeight = 24;
    const maxHeight = lineHeight * 6;

    const handleInput = () => {
      ta.style.height = "auto";
      const newHeight = Math.min(ta.scrollHeight, maxHeight);
      ta.style.height = `${newHeight}px`;
      ta.style.overflowY = ta.scrollHeight > maxHeight ? "scroll" : "hidden";
      setHeight(newHeight);
    };

    ta.addEventListener("input", handleInput);
    handleInput();

    return () => ta.removeEventListener("input", handleInput);
  }, []);

  return (
    <div
      ref={container}
      style={{
        minHeight: `${height + 60}px`,
        transition: "min-height 0.2s ease, max-height 0.2s ease",
      }}
      className={`flex flex-col justify-between gap-3.5 p-2 pb-1 rounded-[25px] w-full relative border border-solid border-gray-dark ${
        darkTheme ? "bg-dark-black-secondary" : "bg-light-white-secondary"
      }`}
    >
      <textarea
        ref={textArea}
        placeholder="How Can We Help You?"
        className={`w-full max-w-[700px] min-w-[280px] resize-none text-left text-[15px] font-montserrat-sans pl-[5px] whitespace-pre-wrap break-words leading-[24px] focus:outline-none rounded-md p-2 pb-[4px] touch-auto [webkit-overflow-scrolling:touch] ${
          darkTheme
            ? "bg-dark-secondary text-dark-white-primary"
            : "bg-light-secondary text-light-black-primary"
        }`}
        style={{
          minHeight: "40px",
          maxHeight: "144px",
          overflowY: "auto",
        }}
      ></textarea>

      {/* Gradient Shadow Behind Buttons */}
      <div
        className={`absolute bottom-[50px] left-0 w-full h-[50px] pointer-events-none z-0 ${
          darkTheme
            ? "bg-gradient-to-t from-dark-black-secondary/90 to-transparent"
            : "bg-gradient-to-t from-light-white-secondary/90 to-transparent"
        }`}
      ></div>

      {/* Button Row */}
      <div className="relative flex items-center justify-between z-10">
        <div className="flex gap-3 items-center justify-start">
          <span
            className={`border border-solid border-gray-dark rounded-[90px] w-[80px] h-[35px] flex items-center justify-center cursor-pointer ${
              darkTheme
                ? "text-dark-white-primary"
                : "text-light-black-primary"
            }`}
          >
            Tools
          </span>
          <span
            className={`border border-solid border-gray-dark rounded-full flex items-center justify-center cursor-pointer w-[35px] h-[35px] ${
              darkTheme
                ? "text-dark-white-primary"
                : "text-light-black-primary"
            }`}
          >
            <i
              className="bx bx-plus"
              style={{
                color: darkTheme ? "#ffffff" : "#000000",
                fontSize: "24px",
              }}
            ></i>
          </span>
        </div>
        <div
          className={`border border-solid border-gray-dark rounded-full flex items-center justify-center cursor-pointer w-[35px] h-[35px] ${
            darkTheme ? "text-dark-white-primary" : "text-light-black-primary"
          }`}
        >
          <Image
            src={"/icons/arrow-up-stroke.png"}
            alt="Submit"
            width={30}
            height={30}
          />
        </div>
      </div>
    </div>
  );
}
