import { SidebarTrigger } from "../sidebar";

/**
 * Only works under SidebarProvider of Shadcn
 */
export default function SidebarScrollTrigger() {

    return (
        <div className={`z-10`}>
            <SidebarTrigger className={`cursor-pointer`} />
        </div>
    )
}