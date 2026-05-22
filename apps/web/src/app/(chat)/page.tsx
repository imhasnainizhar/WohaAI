"use client";

import Sidebar from "@components/layout/sidebar";
import PathChecker from "@lib/page-path-checker";
import TextArea from "@components/ui/input/textareaa";
import "@styles/main/main.global.css";
import "boxicons/css/boxicons.min.css";
import { useTheme } from "@providers/theme";
import { useAppContext } from "@providers/app";

export default function ChatPage() {
  const { theme } = useTheme();
  const { sidebarExpanded } = useAppContext();

  return (
    <div className="text-text-secondary h-full w-full bg-bg-primary">
      <PathChecker />

      <div className="flex h-full w-full">
        {/* Main content */}
        <section
          className="flex flex-col h-full transition-all duration-750 ease-in-out"
          style={{
            width: `calc(100% - ${sidebarExpanded ? "260px" : "60px"})`,
          }}
        >
          {/* Chat page content */}
          <main className="chat-page h-full w-full">
            <div className="h-full flex flex-col w-full">

              {/* Text Content */}
              <div className="h-[50%] w-full flex flex-col justify-end items-center gap-3">
                <h1
                  className="min-w-[300px] max-w-[600px] w-full px-4 text-center
                             font-bold font-sans text-[24px] text-text"
                >
                  What Can I Help You With?
                </h1>

                <p
                  className="min-w-[300px] max-w-[600px] w-full px-4 text-center pb-2.5
                             text-[14px] text-text-secondary font-sans"
                >
                  WoahGPT now has our smartest, fastest, most useful model yet,
                  with thinking built in — so you get the best answer, every time.
                </p>
              </div>

              {/* Chat Box */}
              <div className="h-[50%] w-full flex flex-col justify-start items-center">
                <div className="min-w-[300px] max-w-[690px] w-full px-4">
                  <TextArea />
                </div>
              </div>
            </div>
          </main>
        </section>
      </div>
    </div>
  );
}