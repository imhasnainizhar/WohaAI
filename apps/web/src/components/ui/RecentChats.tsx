import { IconChevronRight, IconMessage } from "@tabler/icons-react"
import Link from "next/link"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible"
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "./sidebar"

export function RecentChats({ recentChats } : { recentChats : { id: string, href: string, title: string }[] }) {
  const hasRecents = recentChats.length > 0

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      {hasRecents ? (
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <SidebarGroupLabel className="w-fit h-auto mx-1 my-1.5 p-1 cursor-pointer select-none hover:text-foreground">
              <span>Recents</span>
              <IconChevronRight className="ml-1 size-4 transition-transform group-data-[state=open]:rotate-90" />
            </SidebarGroupLabel>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {recentChats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton asChild>
                      <Link href={chat.href}>
                        <span className="truncate">
                          {chat.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <SidebarGroupLabel>
          Recents
        </SidebarGroupLabel>
      )}
    </SidebarGroup>
  )
}