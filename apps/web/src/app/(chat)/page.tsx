"use client";

import PathChecker from "@/lib/get-page-url";
import ChatTextArea from "@/components/ui/ChatTextArea";
import "boxicons/css/boxicons.min.css";
import { useTheme } from "@/providers/ThemeProvider";
import { useAppContext } from "@/providers/AppProvider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function ChatPage() {
  const { theme } = useTheme();
  const { sidebarExpanded, smallDevice } = useAppContext();

  return (
    < section
      className={
        `h-full transition-all duration-750 ease-in-out`
      }
      style={{
        width: `${smallDevice ?
          "100%" : sidebarExpanded ?
            `calc(100% - 260px)` :
            `calc(100% - 60px)`
          }`,
      }}
    >
      <div className={
        `flex flex-col w-full h-full justify-end`
      }>
        <div className={
          `w-full h-auto flex flex-col justify-end items-center gap-3 text-center
             text-fluid-xl font-semibold tracking-letter-spacing-primary`
        }>
          How Can I Help You Today?
        </div>

        {/* Chat Box */}
        <div className={
          `w-full h-[50vh] flex justify-center items-end`
        }>
          <div className={
            `max-w-[690px] w-full px-4 py-7`
          }>
            <ChatTextArea />
          </div>
        </div>
      </div>
    </section >
  );
}