"use client"

import MainMenu from "@/components/layout/MainMenu";
import Sidebar from "@/components/layout/Sidebar";
import { Settings } from "@/components/settings/Settings";
import TopLoader from "@/components/ui/TopLoader";
import { useAppContext } from "@/providers/AppProvider";
import SettingSchema from "@/schema/settings"

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { mainMenuVisible, setMainMenuVisible } = useAppContext();
    return (
            <div className={
                `w-full h-full bg-bg-primary text-text-primary overflow-hidden`
            }>
                <div className={
                    `w-full h-full`
                }>
                    {/* <div className="shrink-0 transition-all duration-750 ease-in-out 
                max-[910px]:bg-bg-secondary max-[910px]:absolute
                max-[910px]:w-full max-[910px]:min-w-[380px] h-full"
                    >
                        <Sidebar />
                    </div> */}
                    {/* Chat Page */}
                    <section className={
                        `w-full h-full flex flex-col`
                    }>

                        <main className={
                            `w-full h-full bg-bg-primary`
                        }>
                            {children}
                        </main>
                    </section>
                    {/* Settings */}
                    <Settings schema={SettingSchema} />
                    {/* Main Menu */}
                    {mainMenuVisible && (
                        <div
                            className={
                                ``
                            }
                        >
                            <MainMenu onClickToggle={() => setMainMenuVisible(false)} position={{ zIndex: 100, width: "215px", height: "auto", top: "auto", left: `15px`, right: "auto", bottom: "75px" }} />
                        </div>
                    )}
                </div>
            </div>
    );
}