"use client";
import { useTheme } from "@/providers/ThemeProvider";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ChatMenu from "../expandables/ChatMenu";
import SubmitButton from "./buttons/SubmitButton";
import TextArea from '../input/TextArea';

export default function ChatTextArea() {

  const { theme } = useTheme();
  const darkTheme = theme === "dark";

  const maxHeight = 240;

  const [height, setHeight] = useState(50);

  return (
    <div
      className={
        `w-full bg-bg-secondary relative p-2 rounded-[28px]`
      }
    >
      <div className={
        `w-full px-3`
      }>
        <TextArea setHeight={setHeight} maxHeight={maxHeight} />
      </div>
      <div className={
        `w-full flex justify-between items-center`
      }>
        <ChatMenu />
        <SubmitButton />
      </div>
    </div>
  );
}
