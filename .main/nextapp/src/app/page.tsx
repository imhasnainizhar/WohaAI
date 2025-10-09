"use client";

import Navbar from "../components/layout/navbar";
import SideBar from "@components/layout/sidebar";
import { ReactLenis } from "@utils/react-lenis";
import PathChecker from "@lib/page-path-checker";
import TextArea from "@components/functional-comps/textareaa";
import "@styles/theme/main.global.css";
import "boxicons/css/boxicons.min.css";
import { useTheme } from "@providers/ThemeProvider";
import SideBarSmall from "@components/layout/sidebar_small";
import { useAppContext } from "@providers/AppContext";

export default function Home() {
  const { theme } = useTheme();
  const darkTheme = theme === "dark";

  const { sidebarExpanded } = useAppContext();

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        touchMultiplier: 1.25,
      }}
    >
      <main
        className={`${
          darkTheme
            ? "bg-dark-black-primary text-dark-white-primary"
            : "bg-light-white-primary text-light-black-primary"
        }`}
      >
        <PathChecker />
        <section className="flex h-[100vh] w-full">
          {/* Sidebar */}
          <aside
            className={`flex-shrink-0 transition-all duration-750 ease-in-out max-[910px]:bg-dark-shade-1 max-[910px]:absolute max-[910px]:w-full max-[910px]:min-w-[380px]`}
            style={{
              width: sidebarExpanded ? "260px" : "60px",
            }}
          >
            <div
              className={`relative h-full transition-all duration-750 ease-in-out overflow-hidden z-[100]`}
              style={{
                width: sidebarExpanded ? "260px" : "60px",
                opacity: sidebarExpanded ? 1 : 0,
                backgroundColor: darkTheme
                  ? "var(--theme-dark-black-secondary)"
                  : "var(--theme-light-white-secondary)",
              }}
            >
              <SideBar />
            </div>
            <div
              className="max-w-[60px] h-full overflow-hidden absolute"
              style={{ left: 0, top: 0 }}
            >
              <SideBarSmall />
            </div>
          </aside>

          {/* Main content */}
          <section
            className={`flex flex-col h-full transition-all duration-750 ease-in-out border-l border-solid border-gray-dark`}
            style={{
              width: `calc(100% - ${sidebarExpanded ? "260px" : "60px"})`,
            }}
          >
            <nav className="z-[100] flex justify-center w-full h-[80px]">
              <Navbar />
            </nav>

            {/* Home page content */}
            <main
              className={`home-page ${
                darkTheme
                  ? "bg-dark-black-primary text-dark-white-primary"
                  : "bg-light-white-primary text-light-black-primary"
              } h-full w-full`}
            >
              <div className="h-full flex flex-col w-full">
                <div className="h-[50%] w-full flex flex-col justify-end items-center gap-3">
                  <div className="min-w-[300px] max-w-[600px] w-full px-4 text-center font-bold font-sans text-[24px]">
                    Introducing with WoahAI-2
                  </div>
                  <div
                    className={`min-w-[300px] max-w-[600px] w-full px-4 text-center pb-2.5 text-[14px] ${
                      darkTheme
                        ? "text-dark-white-secondary"
                        : "text-light-black-secondary"
                    }`}
                  >
                    WoahGPT now has our smartest, fastest, most useful model yet,
                    with thinking built in — so you get the best answer, every
                    time.
                  </div>
                </div>
                <div className="h-[50%] w-full flex flex-col justify-start items-center">
                  <div className="min-w-[300px] max-w-[690px] w-full px-4">
                    <TextArea />
                  </div>
                </div>
              </div>
            </main>
          </section>
        </section>
      </main>
    </ReactLenis>
  );
}
