"use client"

import MainMenu from "@components/layout/main-menu";
import Sidebar from "@components/layout/sidebar";
import { Settings } from "@components/section/settings/settings";
import settingsSchema from "@lib/settings";
import { useAppContext } from "@providers/AppContext";


export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { mainMenuVisible, setMainMenuVisible } = useAppContext();
    return (
        <div className="h-full w-full bg-bg text-text-secondary overflow-hidden">
            <div>

            </div>
            <div className="flex h-full w-full">
                <div className="shrink-0 transition-all duration-750 ease-in-out 
                max-[910px]:bg-bg-secondary max-[910px]:absolute
                max-[910px]:w-full max-[910px]:min-w-[380px] h-full"
                >
                    <Sidebar />
                </div>
                {/* Chat Page */}
                <section className="h-full w-full flex flex-col justify-center align-center">
                    <main className="flex flex-col justify-center h-full  
                        w-full bg-bg border border-border border-solid">
                        {children}
                    </main>
                </section>
                {/* Settings */}
                <Settings schema={settingsSchema} />
                {/* Main Menu */}
                {mainMenuVisible && (
                    <div
                        className=""
                    >
                        <MainMenu onClickToggle={() => setMainMenuVisible(false)} position={{ zIndex: 100, width: "215px", height: "auto", top: "auto", left: `15px`, right: "auto", bottom: "75px" }} />
                    </div>
                )}
            </div>
        </div>
    );
}