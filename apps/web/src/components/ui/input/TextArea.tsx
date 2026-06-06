"use client";
import { useTheme } from "@/providers/ThemeProvider";
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
      className={`flex flex-col justify-between gap-3.5 p-2 pb-1 rounded-[25px] w-full 
        relative border border-solid border-primary bg-bg-tertiary`}
    >
      <textarea
        ref={textArea}
        placeholder="Ask me anything..."
        className={`w-full max-w-[700px] min-w-[280px] resize-none text-left text-[15px] 
          pl-[5px] whitespace-pre-wrap wrap-break-word border-none
          leading-[24px] focus:outline-none rounded-md p-2 pb-[4px] touch-auto
          [webkit-overflow-scrolling:touch] text-text-primary bg-bg-tertiary`}
        style={{
          minHeight: "40px",
          maxHeight: "144px",
          overflowY: "auto",
        }}
      ></textarea>

      {/* Gradient Shadow Behind Buttons */}
      <div
        className={`absolute bottom-[50px] left-0 w-full h-[50px] pointer-events-none z-0 ${darkTheme
          ? "bg-linear-to-t from-bg-bg/90 to-transparent"
          : "bg-linear-to-t from-bg-primary/90 to-transparent"
          }`}
      ></div>

      {/* Button Row */}
      <div className="relative flex items-center justify-between z-10">
        <div className="flex gap-3 items-center justify-start">
          <span
            className={`border border-solid border-primary rounded-[90px] w-[80px] h-[35px] flex 
              items-center justify-center cursor-pointer text-text-primary`}
          >
            Tools
          </span>
          <span
            className={`rounded-full flex items-center
              justify-center cursor-pointer w-auto h-auto text-text text-[25px]`}
          >
            +
          </span>
        </div>
        <div
          className={`border border-solid border-primary rounded-full flex items-center 
            justify-center cursor-pointer w-[35px] h-[35px] text-text-primary`}
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
