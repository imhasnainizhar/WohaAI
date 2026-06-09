"use client"

import { useAppContext } from "@/providers/AppProvider"
import { SidebarTrigger } from "../sidebar";

/**
 * Only works under SidebarProvider of Shadcn
 */
export default function MobileSidebarScrollTrigger() {
    const { isSmallDevice } = useAppContext();

    return (
        <div className={`fixed top-3 left-3 z-10`}>
            {isSmallDevice && (
                <SidebarTrigger className={`cursor-pointer`} />
            )}
        </div>
    )
}