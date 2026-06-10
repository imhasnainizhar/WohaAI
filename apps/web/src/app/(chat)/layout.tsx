"use client"

import { Settings } from "@/components/settings/Settings";
import SettingSchema from "@/schema/settings"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ChatSidebar } from "@/components/layout/ChatSidebar"
import "@/styles/dist/main.global.css"
import AgentOptionsProvider from "@/providers/AgentOptionsProvider";
import IncognitoModeButton from "@/components/ui/buttons/IncognitoModeButton";
import SidebarScrollTrigger from "@/components/ui/buttons/SidebarScrollTrigger";


export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AgentOptionsProvider>
            <SidebarProvider className={`w-full h-full`}>
                { /* Button to expand sidebar on mobile */}
                <ChatSidebar />
                <SidebarInset className={`relative`}>
                    <div
                        className={`absolute top-3 left-3 z-50`}
                    >
                        <SidebarScrollTrigger />
                    </div>
                    {children}
                </SidebarInset>

                {/* Settings */}
                <Settings schema={SettingSchema} />
            </SidebarProvider>
        </AgentOptionsProvider>
    );
}