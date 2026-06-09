"use client"

import { Settings } from "@/components/settings/Settings";
import { useAppContext } from "@/providers/AppProvider";
import SettingSchema from "@/schema/settings"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ChatSidebar } from "@/components/layout/ChatSidebar"
import "@/styles/dist/main.global.css"
import MobileSidebarScrollTrigger from "@/components/ui/buttons/MobileSidebarScrollTrigger";
import AgentOptionsProvider from "@/providers/AgentOptionsProvider";
import IncognitoModeButton from "@/components/ui/buttons/IncognitoModeButton";


export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AgentOptionsProvider>
            <SidebarProvider className={`h-full`}>
                { /* Button to expand sidebar on mobile */ }
                <MobileSidebarScrollTrigger />
                <div className={
                    `w-full h-full bg-background text-text-primary overflow-hidden text-fluid-base`
                }>
                    <div className={
                        `w-full h-full`
                    }>
                        {/* <div className="shrink-0 transition-all duration-750 ease-in-out 
                max-[910px]:absolute
                max-[910px]:w-full max-[910px]:min-w-[380px] h-full"
                    >
                        <Sidebar />
                    </div> */}
                        {/* Chat Page */}
                        <section className={
                            `w-full h-full flex flex-col`
                        }>

                            <main className={
                                `w-full h-full`
                            }>
                                <ChatSidebar />
                                {children}
                            </main>
                        </section>
                        {/* Settings */}
                        <Settings schema={SettingSchema} />
                        {/* Main Menu */}
                        {/* {mainMenuVisible && (
                            <div
                                className={
                                    ``
                                }
                            >
                                <SidebarPopover onClickToggle={() => setMainMenuVisible(false)} position={{ zIndex: 100, width: "215px", height: "auto", top: "auto", left: `15px`, right: "auto", bottom: "75px" }} />
                            </div>
                        )} */}
                    </div>
                </div>
            </SidebarProvider>
        </AgentOptionsProvider>
    );
}