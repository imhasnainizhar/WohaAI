"use client";

import PathChecker from "@/lib/get-page-url";
import ChatTextArea from "@/components/ui/ChatTextArea";
import "boxicons/css/boxicons.min.css";
import { isDarkTheme } from "@/providers/ThemeProvider";
import { useAppContext } from "@/providers/AppProvider";
import IncognitoModeButton from "@/components/ui/buttons/IncognitoModeButton";

export default function ChatPage() {
  const { sidebarExpanded, isSmallDevice } = useAppContext();

  return (
    <section
      className={
        `h-full transition-all duration-750 ease-in-out flex justify-center`
      }
      style={{
        width: `${isSmallDevice ?
          "100%" : sidebarExpanded ?
            `calc(100% - 260px)` :
            `calc(100% - 60px)`
          }`,
      }}
    >
      { /* Button to switch to incognito mode */ }
      <IncognitoModeButton color={isDarkTheme() ? "#e0e0e0" : "#0f0f0f"} />

      <div className={
        `w-full h-full relative max-w-160`
      }>
        <div className={
          `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center
             text-fluid-2xl font-gerogia-sans tracking-tighter`
        }>
          How can I help U?
        </div>

        {/* Chat Box */}
        <div className={
          `absolute bottom-0 w-full h-auto px-4 py-7`
        }>
          <ChatTextArea />
        </div>
      </div>
    </section >
  );
}